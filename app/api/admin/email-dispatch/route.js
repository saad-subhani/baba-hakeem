import {NextResponse} from 'next/server';
import {dispatchOrderEmails,verifyEmailAdminAccess} from '../../../../lib/orderEmailDispatch';

export const runtime='nodejs';

const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});

// No browser-provided addresses, templates, totals, or order content are used.
// This endpoint can only process persisted jobs and only for the approved owner.
export async function POST(request){
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)
    return reply({success:false,error:'Invalid request origin.'},403);
  const header=request.headers.get('authorization')||'';
  const token=header.startsWith('Bearer ')?header.slice(7).trim():'';
  const auth=await verifyEmailAdminAccess(token);
  if(!auth.ok)return reply({success:false,error:auth.reason},auth.status);
  const result=await dispatchOrderEmails({limit:4});
  if(result.status==='not_configured')
    return reply({success:false,error:'Order email delivery is not configured.'},503);
  if(result.status==='queue_error')
    return reply({success:false,error:'Could not process the notification queue.'},503);
  return reply({success:true,...result});
}
