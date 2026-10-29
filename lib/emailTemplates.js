import { sendBrandedEmail, emailIsConfigured } from './emailSender';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
const safeEmail = (value) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(String(value || '').trim());

function shell({ eyebrow, title, greeting, body, details, actionLabel, actionUrl, footer = 'Baba Hakeem Herbal Products · Pakistan' }) {
  return `<!doctype html><html><body style="margin:0;background:#f2f5ef;color:#19321c;font-family:Arial,Helvetica,sans-serif"><div style="padding:28px 12px"><div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e1e9dc;border-radius:14px;overflow:hidden"><div style="height:8px;background:#7ed957"></div><div style="padding:30px 34px 24px;text-align:center"><img src="cid:baba-hakeem-logo" width="190" alt="Baba Hakeem" style="display:block;width:190px;max-width:70%;height:auto;margin:0 auto 22px"><div style="color:#66814e;font-size:11px;font-weight:bold;letter-spacing:2px">${esc(eyebrow)}</div><h1 style="margin:12px 0;color:#0b3010;font:600 30px/1.2 Arial,Helvetica,sans-serif">${esc(title)}</h1></div><div style="padding:0 34px 32px"><p style="margin:0 0 12px;font-size:16px;line-height:1.65">${greeting}</p><p style="margin:0 0 22px;color:#58665a;font-size:14px;line-height:1.75">${body}</p>${details || ''}${actionUrl ? `<div style="text-align:center;margin:26px 0 6px"><a href="${esc(actionUrl)}" style="display:inline-block;background:#0b3010;border-radius:6px;padding:13px 22px;color:#fff;font-size:14px;font-weight:bold;text-decoration:none">${esc(actionLabel)}</a></div>` : ''}<div style="margin-top:28px;padding-top:18px;border-top:1px solid #e3eadf;color:#82907d;text-align:center;font-size:11px;line-height:1.6">${esc(footer)}</div></div></div></div></body></html>`;
}

function orderDetails(order, items, includeCustomer = false) {
  const rows = (items || []).map((item) => `<tr><td style="padding:11px 8px;border-bottom:1px solid #e8eee4;font-size:13px">${esc(item.name)} × ${Number(item.quantity || item.qty || 0)}</td><td style="padding:11px 8px;border-bottom:1px solid #e8eee4;text-align:right;font-size:13px">${money(item.line_total ?? item.lineTotal)}</td></tr>`).join('');
  const customer = includeCustomer ? `<div style="margin-top:18px;padding:15px;background:#f5f8f2;border-radius:8px;font-size:13px;line-height:1.8"><strong>Delivery details</strong><br>${esc(order.customer_name)}<br>${esc(order.phone)} · ${esc(order.city)}<br>${esc(order.address)}${order.customer_email ? `<br>${esc(order.customer_email)}` : ''}${order.notes ? `<br>Note: ${esc(order.notes)}` : ''}</div>` : '';
  return `<div style="padding:15px;background:#eff6e9;border-radius:8px"><span style="color:#64745f;font-size:11px">ORDER NUMBER</span><br><strong style="font-size:18px;letter-spacing:.5px">${esc(order.order_number)}</strong></div><table role="presentation" style="width:100%;margin-top:16px;border-collapse:collapse"><tbody>${rows}</tbody></table><div style="padding:15px 8px 0;text-align:right;font-size:14px">Total <strong style="margin-left:12px;font-size:18px">${money(order.total_amount)}</strong></div><p style="color:#687467;font-size:12px;line-height:1.6">Payment method: ${esc(order.payment_method || 'Cash on Delivery')}<br>Our team will confirm delivery details with you.</p>${customer}`;
}

export function buildOrderEmail(job) {
  const isCustomer = job.job_kind === 'customer';
  const title = isCustomer ? 'We received your order' : 'A new order has arrived';
  const greeting = isCustomer ? `Hello ${esc(job.customer_name)},` : 'A new order was placed on the Baba Hakeem store.';
  const body = isCustomer ? 'Thank you for shopping with Baba Hakeem. Your order request is in our system, and our team will contact you to confirm delivery details.' : 'Review this order in the admin dashboard and contact the customer if you need to confirm any details.';
  const html = shell({ eyebrow: isCustomer ? 'ORDER CONFIRMATION' : 'STORE ORDER ALERT', title, greeting, body, details: orderDetails(job, job.items, !isCustomer) });
  const lines = (job.items || []).map((item) => `${item.name} × ${Number(item.quantity || item.qty || 0)} — ${money(item.line_total ?? item.lineTotal)}`);
  return {
    subject: `${isCustomer ? 'Order received' : 'New order'} · ${job.order_number}`,
    html,
    text: [`${title}`, `Hello ${job.customer_name || ''}`, `Order: ${job.order_number}`, ...lines, `Total: ${money(job.total_amount)}`, `Payment: ${job.payment_method || 'Cash on Delivery'}`, isCustomer ? 'Our team will contact you to confirm delivery details.' : `Customer phone: ${job.phone}; ${job.city}; ${job.address}`].join('\n'),
  };
}

export async function sendContactEmails(enquiry) {
  if (!emailIsConfigured()) return { status: 'not_configured' };
  const storeBody = `<div style="padding:16px;background:#f5f8f2;border-radius:8px;font-size:14px;line-height:1.8"><strong>Topic:</strong> ${esc(enquiry.category)}<br><strong>Name:</strong> ${esc(enquiry.name)}<br><strong>Email:</strong> ${esc(enquiry.email || 'Not provided')}<br><strong>Phone:</strong> ${esc(enquiry.phone || 'Not provided')}<br><strong>Reference:</strong> ${esc(enquiry.reference || 'None')}<br><strong>Message:</strong><br>${esc(enquiry.message).replace(/\n/g, '<br>')}</div>`;
  const storeHtml = shell({ eyebrow: 'CONTACT FORM', title: 'A customer sent a message', greeting: 'A new enquiry was submitted through the Baba Hakeem website.', body: 'Reply directly to the customer using their contact details below.', details: storeBody });
  const storeMail = sendBrandedEmail({ to: process.env.MAIL_NOTIFY_TO || process.env.SMTP_USER, subject: `Website enquiry · ${enquiry.category}`, html: storeHtml, text: `Website enquiry\nTopic: ${enquiry.category}\nName: ${enquiry.name}\nEmail: ${enquiry.email || 'Not provided'}\nPhone: ${enquiry.phone || 'Not provided'}\nReference: ${enquiry.reference || 'None'}\n\n${enquiry.message}`, replyTo: safeEmail(enquiry.email) ? enquiry.email : undefined });
  const customerMail = safeEmail(enquiry.email) ? sendBrandedEmail({ to: enquiry.email, subject: 'We received your message · Baba Hakeem', html: shell({ eyebrow: 'MESSAGE RECEIVED', title: 'Thank you for getting in touch', greeting: `Hello ${esc(enquiry.name)},`, body: 'We have received your message and our team will get back to you as soon as possible.', details: `<div style="padding:16px;background:#f5f8f2;border-radius:8px;font-size:14px;line-height:1.8"><strong>Your topic:</strong> ${esc(enquiry.category)}${enquiry.reference ? `<br><strong>Reference:</strong> ${esc(enquiry.reference)}` : ''}<br><br>${esc(enquiry.message).replace(/\n/g, '<br>')}</div>` }), text: `Hello ${enquiry.name},\n\nWe received your message about ${enquiry.category}. Our team will get back to you as soon as possible.\n\nYour message: ${enquiry.message}` }) : Promise.resolve({ sent: true, skipped: true });
  const [storeResult, customerResult] = await Promise.all([storeMail, customerMail]);
  return { status: storeResult.sent && customerResult.sent ? 'sent' : 'partial' };
}

export { shell };
