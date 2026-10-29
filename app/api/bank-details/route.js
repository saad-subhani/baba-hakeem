import { NextResponse } from 'next/server';
import pool from '../../../lib/mysql';
import { currentAdmin } from '../../../lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (body, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET() {
  try {
    const [[row]] = await pool.query('SELECT account_title,bank_name,logo_url,iban,account_number,enabled FROM store_bank_details WHERE id=1 LIMIT 1');
    const admin = await currentAdmin();
    return reply({ bankDetails: row && (admin || Number(row.enabled)) ? row : { enabled: 0 } });
  } catch (error) {
    console.error('Bank details load failed:', error.message);
    return reply({ error: 'Bank transfer details are temporarily unavailable.' }, 503);
  }
}

export async function PUT(request) {
  if (!await currentAdmin()) return reply({ error: 'Admin sign-in required.' }, 401);
  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid request.' }, 400); }
  const details = {
    account_title: String(body?.account_title || '').trim().slice(0, 160),
    bank_name: String(body?.bank_name || '').trim().slice(0, 120),
    logo_url: String(body?.logo_url || '').trim().slice(0, 700),
    iban: String(body?.iban || '').trim().replace(/\s+/g, '').slice(0, 80),
    account_number: String(body?.account_number || '').trim().slice(0, 80),
    enabled: body?.enabled ? 1 : 0,
  };
  if (details.enabled && (!details.account_title || !details.bank_name || !details.iban || !details.account_number))
    return reply({ error: 'Add the account title, bank name, IBAN, and account number before enabling bank transfer.' }, 422);
  if (details.logo_url && !details.logo_url.startsWith('/') && !/^https:\/\//i.test(details.logo_url))
    return reply({ error: 'The bank logo must be an HTTPS image URL or a store upload path.' }, 422);
  try {
    await pool.query(`INSERT INTO store_bank_details (id,account_title,bank_name,logo_url,iban,account_number,enabled,updated_at)
      VALUES (1,?,?,?,?,?,?,NOW()) ON DUPLICATE KEY UPDATE account_title=VALUES(account_title),bank_name=VALUES(bank_name),logo_url=VALUES(logo_url),iban=VALUES(iban),account_number=VALUES(account_number),enabled=VALUES(enabled),updated_at=NOW()`,
    [details.account_title, details.bank_name, details.logo_url, details.iban, details.account_number, details.enabled]);
    return reply({ success: true, bankDetails: details });
  } catch (error) {
    console.error('Bank details save failed:', error.message);
    return reply({ error: 'Could not save bank transfer settings.' }, 503);
  }
}
