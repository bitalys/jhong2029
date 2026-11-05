import { json, makeSession, loginCookie } from './_shared.mjs';
export default async function handler(request){
  if(request.method!=='POST') return json({error:'Method not allowed'},405);
  try{
    const {pin=''} = await request.json();
    if(String(pin) !== String(process.env.ADMIN_PIN || '1111')) return json({error:'Incorrect PIN.'},401);
    return json({ok:true},200,{'Set-Cookie':loginCookie(makeSession())});
  }catch(e){ return json({error:e.message||'Unable to sign in.'},400); }
}
