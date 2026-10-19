import {robotsText} from '../../lib/siteSeo.mjs';
export const dynamic='force-dynamic';
export function GET(request){
  const origin=new URL(request.url).origin;
  return new Response(robotsText(origin),{headers:{
    'Content-Type':'text/plain; charset=utf-8',
    'Cache-Control':'public, max-age=300',
    'X-Content-Type-Options':'nosniff'
  }});
}
