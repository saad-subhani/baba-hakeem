import {NextResponse} from 'next/server';
import {runRpc} from '../../../../lib/store';

export const runtime='nodejs';
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});

export async function POST(request){
  let body;
  try{body=await request.json();}catch{return reply({data:null,error:{message:'Invalid request.'}},400);}
  if(!body||typeof body!=='object'||typeof body.name!=='string')
    return reply({data:null,error:{message:'Invalid rpc request.'}},400);
  const result=await runRpc(body.name,body.args||{});
  return reply(result,result.error?400:200);
}
