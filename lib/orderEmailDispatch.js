import pool from './mysql';
import { emailIsConfigured, sendBrandedEmail } from './emailSender';
import { buildOrderEmail } from './emailTemplates';

export function orderEmailConfigured() { return emailIsConfigured(); }

/** Claim pending order mail jobs transactionally to prevent duplicate sends. */
async function claimJobs({ orderNumber = null, limit = 6 }) {
  await pool.query('START TRANSACTION');
  const [rows] = await pool.query(
    "SELECT o.id AS job_id,o.order_id,o.kind AS job_kind,o.recipient_email,ord.order_number,ord.customer_name,ord.phone,ord.city,ord.address,ord.notes,ord.customer_email,ord.payment_method,ord.total_amount " +
    "FROM order_email_outbox o JOIN orders ord ON ord.id=o.order_id " +
    "WHERE o.status IN ('pending','failed') AND o.attempts<10 AND (o.next_attempt_at IS NULL OR o.next_attempt_at<=NOW()) " +
    (orderNumber ? 'AND ord.order_number=? ' : '') +
    'ORDER BY o.created_at ASC LIMIT ? FOR UPDATE',
    orderNumber ? [orderNumber, Number(limit)] : [Number(limit)]
  );
  if (!rows.length) { await pool.query('COMMIT'); return []; }
  const jobs = [];
  for (const row of rows) {
    await pool.query("UPDATE order_email_outbox SET status='processing',claimed_at=NOW(),attempts=attempts+1 WHERE id=?", [row.job_id]);
    const [items] = await pool.query('SELECT product_name AS name,quantity,unit_price,line_total FROM order_items WHERE order_id=?', [row.order_id]);
    jobs.push({ ...row, items });
  }
  await pool.query('COMMIT');
  return jobs;
}

/** Send the persisted order emails; SMTP credentials remain server-side. */
export async function dispatchOrderEmails({ orderNumber = null, limit = 6 } = {}) {
  if (!emailIsConfigured()) return { status: 'not_configured', accepted: 0, failed: 0 };
  try {
    const jobs = await claimJobs({ orderNumber, limit: Math.min(10, Math.max(1, limit)) });
    let accepted = 0;
    let failed = 0;
    for (const job of jobs) {
      const content = buildOrderEmail(job);
      const result = await sendBrandedEmail({
        to: job.job_kind === 'store' ? process.env.MAIL_NOTIFY_TO || process.env.SMTP_USER : job.recipient_email,
        subject: content.subject,
        html: content.html,
        text: content.text,
        replyTo: job.job_kind === 'store' && job.customer_email ? job.customer_email : undefined,
      });
      await pool.query(
        'UPDATE order_email_outbox SET status=?,sent_at=CASE WHEN ? THEN NOW() ELSE sent_at END,provider_message_id=?,last_error=? WHERE id=?',
        [result.sent ? 'sent' : 'failed', result.sent, result.id, result.error || null, job.job_id]
      );
      if (result.sent) accepted++; else failed++;
    }
    return { status: failed ? 'retry_pending' : 'processed', accepted, failed };
  } catch (error) {
    console.error('Order email dispatcher unavailable:', error.code || 'QUEUE_ERROR');
    return { status: 'queue_error', accepted: 0, failed: 0 };
  }
}

/** Owner access is verified against the local HTTP-only session cookie. */
export async function verifyEmailAdminAccess() {
  if (!emailIsConfigured()) return { ok: false, status: 503, reason: 'Order email delivery is not configured.' };
  const { ownerStatus } = await import('./store');
  const status = await ownerStatus();
  if (!status.is_owner) return { ok: false, status: 401, reason: 'Owner session required.' };
  return { ok: true };
}
