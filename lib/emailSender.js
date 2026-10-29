import nodemailer from 'nodemailer';
import path from 'node:path';

const MAILBOX = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
let transporter;

function config() {
  const env = process.env;
  const host = String(env.SMTP_HOST || '').trim();
  const port = Number(env.SMTP_PORT || 465);
  const user = String(env.SMTP_USER || '').trim();
  const password = env.SMTP_PASSWORD || '';
  const fromAddress = String(env.MAIL_FROM_ADDRESS || user).trim();
  const fromName = String(env.MAIL_FROM_NAME || 'Baba Hakeem').trim();
  const notifyTo = String(env.MAIL_NOTIFY_TO || user).trim();
  const enabled = env.MAIL_ENABLED === 'true' && !!host && Number.isInteger(port) && !!user && !!password && MAILBOX.test(fromAddress) && MAILBOX.test(notifyTo);
  return { host, port, user, password, fromAddress, fromName, notifyTo, enabled };
}

export function emailIsConfigured() { return config().enabled; }

function getTransporter(settings) {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.port === 465,
      auth: { user: settings.user, pass: settings.password },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
      tls: { minVersion: 'TLSv1.2' },
    });
  }
  return transporter;
}

function logoAttachment() {
  return [{
    filename: 'baba-hakeem-logo.png',
    path: path.join(process.cwd(), 'public', 'brand', 'baba-hakeem-logo.png'),
    cid: 'baba-hakeem-logo',
    contentType: 'image/png',
  }];
}

export async function sendBrandedEmail({ to, subject, html, text, replyTo }) {
  const settings = config();
  if (!settings.enabled) return { sent: false, error: 'Email is not configured.' };
  if (!MAILBOX.test(String(to || '').trim())) return { sent: false, error: 'Recipient email is invalid.' };
  try {
    const info = await getTransporter(settings).sendMail({
      from: { name: settings.fromName, address: settings.fromAddress },
      to: String(to).trim(),
      ...(replyTo && MAILBOX.test(replyTo) ? { replyTo } : {}),
      subject: String(subject || 'Baba Hakeem').slice(0, 180),
      text: String(text || ''),
      html: String(html || ''),
      attachments: logoAttachment(),
    });
    return { sent: true, id: info.messageId || null };
  } catch (error) {
    // Never log SMTP responses, auth details, message bodies, or recipient PII.
    console.error('Branded email delivery failed:', error.code || 'SMTP_ERROR');
    return { sent: false, error: 'SMTP delivery failed.' };
  }
}

export async function verifyEmailConnection() {
  const settings = config();
  if (!settings.enabled) return { ok: false, error: 'Email is not configured.' };
  try {
    await getTransporter(settings).verify();
    return { ok: true };
  } catch (error) {
    console.error('SMTP connection check failed:', error.code || 'SMTP_ERROR');
    return { ok: false, error: 'Could not authenticate with the configured SMTP server.' };
  }
}
