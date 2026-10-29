import crypto from 'crypto';
import {cookies} from 'next/headers';

const SECRET=process.env.ADMIN_SESSION_SECRET||'baba-hakeem-local-session-secret';
export const COOKIE_NAME='bh_admin_token';

const b64=value=>Buffer.from(value).toString('base64url');

/** createSessionToken(adminRow): signed, tamper-proof bearer value for a signed-in admin. */
export function createSessionToken(admin){
  const payload=b64(JSON.stringify({id:admin.id,email:admin.email}));
  const sig=crypto.createHmac('sha256',SECRET).update(payload).digest('base64url');
  return payload+'.'+sig;
}
export function readSessionToken(token){
  if(!token||typeof token!=='string'||!token.includes('.'))return null;
  const [payload,sig]=token.split('.');
  const expected=crypto.createHmac('sha256',SECRET).update(payload).digest('base64url');
  if(sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;
  try{return JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));}catch{return null;}
}
export async function getSessionFromCookies(){
  const store=await cookies();
  return readSessionToken(store.get(COOKIE_NAME)?.value);
}
