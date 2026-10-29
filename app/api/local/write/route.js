import {NextResponse} from 'next/server';
import {runWrite} from '../../../../lib/store';

export const runtime='nodejs';
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});

export async function POST(request){
  let body;
  try{body=await request.json();}catch{return reply({data:null,error:{message:'Invalid request.'}},400);}
  if(!body||typeof body!=='object'||!body.table||!body.action)
    return reply({data:null,error:{message:'Invalid write request.'}},400);
  const result=await runWrite(body);
  return reply(result,result.error?400:200);
}
