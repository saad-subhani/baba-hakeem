import {NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {currentAdmin} from '../../../../lib/store';

export const runtime='nodejs';
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
const UPLOAD_DIR=path.join(process.cwd(),'public','uploads');

// Local replacement for supabase.storage.from('product-images').
// Files are saved under public/uploads and served from /uploads/.
export async function POST(request){
  const admin=await currentAdmin();
  if(!admin)return reply({error:{message:'Owner session required.'}},401);
  if(request.headers.get('action')==='delete'){
    let body;
    try{body=await request.json();}catch{return reply({error:{message:'Invalid request.'}},400);}
    const paths=Array.isArray(body.paths)?body.paths:[];
    for(const p of paths.slice(0,10)){
      const relative=String(p||'');
      const match=relative.match(/^(videos\/)?([a-zA-Z0-9._-]+)$/);
      if(!match)continue;
      const directory=match[1]?path.join(UPLOAD_DIR,'videos'):UPLOAD_DIR;
      try{await fs.promises.unlink(path.join(directory,match[2]));}catch{}
    }
    return reply({data:[],error:null});
  }
  let form;
  try{form=await request.formData();}catch{return reply({error:{message:'Invalid upload.'}},400);}
  const file=form.get('file');
  if(!file||typeof file==='string')return reply({error:{message:'No file received.'}},400);
  const kind=String(form.get('kind')||'image');
  const isVideo=kind==='video';
  const videoTypes=new Map([['video/mp4','mp4'],['video/webm','webm'],['video/quicktime','mov']]);
  const videoExt=videoTypes.get(String(file.type||'').toLowerCase());
  if(isVideo&&!videoExt)return reply({error:{message:'Use an MP4, WEBM, or MOV video.'}},400);
  if(!isVideo&&!String(file.type||'').startsWith('image/'))return reply({error:{message:'Please choose an image file.'}},400);
  const maxBytes=isVideo?100*1024*1024:4*1024*1024;
  if(file.size>maxBytes)return reply({error:{message:isVideo?'Video must be smaller than 100 MB.':'Please use an image smaller than 4 MB.'}},400);
  const ext=isVideo?videoExt:((String(file.name||'').split('.').pop()||'webp').toLowerCase().replace(/[^a-z0-9]/g,'')||'webp');
  const name=crypto.randomUUID()+'.'+ext;
  const targetDir=isVideo?path.join(UPLOAD_DIR,'videos'):UPLOAD_DIR;
  try{
    const bytes=Buffer.from(await file.arrayBuffer());
    if(isVideo){
      const isMp4=videoExt==='mp4'||videoExt==='mov';
      const hasMp4Header=bytes.length>12&&bytes.toString('ascii',4,8)==='ftyp';
      const hasWebmHeader=bytes.length>4&&bytes.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]));
      if((isMp4&&!hasMp4Header)||(videoExt==='webm'&&!hasWebmHeader))return reply({error:{message:'The uploaded file does not match its video format.'}},400);
    }
    await fs.promises.mkdir(targetDir,{recursive:true});
    await fs.promises.writeFile(path.join(targetDir,name),bytes);
  }catch(err){
    console.error('Local image upload failed:',err.message);
    return reply({error:{message:'Could not save the image.'}},500);
  }
  const storedPath=isVideo?'videos/'+name:name;
  return reply({path:storedPath,url:'/uploads/'+storedPath,error:null});
}
