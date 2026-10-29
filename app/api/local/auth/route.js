import {NextResponse} from 'next/server';
import pool from '../../../../lib/mysql';
import {verifyPassword,hashPassword} from '../../../../lib/passwordHash';
import {COOKIE_NAME,createSessionToken} from '../../../../lib/session';
import {currentAdmin} from '../../../../lib/store';

export const runtime='nodejs';

const fail=(message,status=401)=>NextResponse.json({error:{message}},{status,headers:{'Cache-Control':'no-store'}});
const ok=body=>NextResponse.json(body,{headers:{'Cache-Control':'no-store'}});
const cookieOptions={
  httpOnly:true,sameSite:'lax',path:'/',maxAge:60*60*24*7
};

export async function GET(){
  const admin=await currentAdmin();
  return ok({
    session:admin?{access_token:'local-session',user:{id:admin.id,email:admin.email}}:null,
    user:admin?{id:admin.id,email:admin.email}:null,
    error:null
  });
}

export async function POST(request){
  let body;
  try{body=await request.json();}catch{return fail('Invalid request.',400);}
  const action=body?.action;
  if(action==='login'){
    const email=String(body.email||'').trim().toLowerCase();
    const password=String(body.password||'');
    const [[admin]]=await pool.query('SELECT * FROM admins WHERE LOWER(email)=? LIMIT 1',[email]);
    if(!admin||!verifyPassword(password,admin.password))return fail('Invalid login credentials.');
    // Upgrade legacy plaintext password storage to a proper hash on first login.
    if(!String(admin.password).startsWith('scrypt$'))
      await pool.query('UPDATE admins SET password=? WHERE id=?',[hashPassword(password),admin.id]);
    const token=createSessionToken({id:admin.id,email:admin.email});
    const response=ok({data:{user:{id:admin.id,email:admin.email}},error:null});
    response.cookies.set(COOKIE_NAME,token,cookieOptions);
    return response;
  }
  if(action==='logout'){
    const response=ok({data:{},error:null});
    response.cookies.set(COOKIE_NAME,'',{...cookieOptions,maxAge:0});
    return response;
  }
  // Admin-only actions below require a live session.
  const admin=await currentAdmin();
  if(!admin)return fail('Owner session required.');
  if(action==='update-password'){
    const password=String(body.password||'');
    if(password.length<8)return fail('New password must be at least 8 characters.');
    await pool.query('UPDATE admins SET password=? WHERE id=?',[hashPassword(password),admin.id]);
    return ok({data:{},error:null});
  }
  if(action==='signup')return fail('Local database mode: the admin account already exists. Sign in with admin@baba-hakeem.com.');
  if(action==='reset')return fail('Password recovery emails are not available in local database mode. Reset the password directly in the admins table.');
  if(action==='otp')return fail('Email invitations are not available in local database mode.');
  return fail('Unknown auth action.',400);
}
