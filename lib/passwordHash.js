import crypto from 'crypto';

/** Hash a password for storage in the local admins table. */
export function hashPassword(plain){
  const salt=crypto.randomBytes(16).toString('hex');
  const hash=crypto.scryptSync(String(plain),salt,64).toString('hex');
  return 'scrypt$'+salt+'$'+hash;
}
/** Verify against either a scrypt$... hash or a legacy plaintext value. */
export function verifyPassword(plain,stored){
  if(typeof stored!=='string')return false;
  if(stored.startsWith('scrypt$')){
    const [,salt,hash]=stored.split('$');
    if(!salt||!hash)return false;
    const candidate=crypto.scryptSync(String(plain),salt,64).toString('hex');
    return candidate.length===hash.length&&crypto.timingSafeEqual(Buffer.from(candidate),Buffer.from(hash));
  }
  return plain===stored;
}
