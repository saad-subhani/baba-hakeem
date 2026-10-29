import { NextResponse } from 'next/server';
import pool from '../../../lib/mysql';
import { currentAdmin } from '../../../lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const reply = (body, status = 200) => NextResponse.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store' },
});

export async function GET() {
  try {
    const [[settings]] = await pool.query(
      'SELECT whatsapp_number,phone_number,email,address,facebook_url,instagram_url,tiktok_url,youtube_url,updated_at FROM store_contact_settings WHERE id=1 LIMIT 1'
    );
    return reply({ settings: settings || null });
  } catch (error) {
    console.error('Store contact settings load failed:', error.message);
    return reply({ error: 'Contact settings are temporarily unavailable.' }, 503);
  }
}

export async function PUT(request) {
  if (!await currentAdmin()) return reply({ error: 'Admin sign-in required.' }, 401);

  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid request.' }, 400); }

  const fields = ['whatsapp_number', 'phone_number', 'email', 'address', 'facebook_url', 'instagram_url', 'tiktok_url', 'youtube_url'];
  const settings = Object.fromEntries(fields.map((field) => [field, String(body?.[field] || '').trim()]));
  settings.whatsapp_number = settings.whatsapp_number.slice(0, 40);
  settings.phone_number = settings.phone_number.slice(0, 40);
  settings.email = settings.email.slice(0, 254);
  settings.address = settings.address.slice(0, 600);

  for (const field of ['whatsapp_number', 'phone_number']) {
    const value = settings[field];
    if (value && (value.replace(/\D/g, '').length < 8 || !/^[+\d\s().-]+$/.test(value))) {
      return reply({ error: `Enter a valid ${field === 'phone_number' ? 'contact phone' : 'WhatsApp'} number.` }, 422);
    }
  }
  if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    return reply({ error: 'Enter a valid contact email address.' }, 422);
  }
  for (const field of ['facebook_url', 'instagram_url', 'tiktok_url', 'youtube_url']) {
    if (settings[field] && !/^https:\/\//i.test(settings[field])) {
      return reply({ error: `${field.replace('_url', '')} link must start with https://.` }, 422);
    }
    settings[field] = settings[field].slice(0, 700);
  }

  try {
    await pool.query(`INSERT INTO store_contact_settings
      (id,whatsapp_number,phone_number,email,address,facebook_url,instagram_url,tiktok_url,youtube_url,updated_at)
      VALUES (1,?,?,?,?,?,?,?,?,NOW())
      ON DUPLICATE KEY UPDATE whatsapp_number=VALUES(whatsapp_number),phone_number=VALUES(phone_number),email=VALUES(email),address=VALUES(address),facebook_url=VALUES(facebook_url),instagram_url=VALUES(instagram_url),tiktok_url=VALUES(tiktok_url),youtube_url=VALUES(youtube_url),updated_at=NOW()`,
    fields.map((field) => settings[field]));
    return reply({ success: true, settings });
  } catch (error) {
    console.error('Store contact settings save failed:', error.message);
    return reply({ error: 'Could not save contact settings.' }, 503);
  }
}
