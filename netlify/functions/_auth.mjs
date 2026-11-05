import crypto from 'node:crypto';

const COOKIE = 'jackson_admin_session';
const ttl = 60 * 60 * 24 * 7;

function b64(input){return Buffer.from(input).toString('base64url');}
function sign(value, secret){return crypto.createHmac('sha256', secret).update(value).digest('base64url');}

export function makeSession(secret){
  const payload=b64(JSON.stringify({iat:Date.now(),exp:Date.now()+ttl*1000}));
  return `${payload}.${sign(payload,secret)}`;
}
export function validSession(event, secret){
  const cookie=event.headers?.cookie||'';
  const found=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${COOKIE}=`));
  if(!found)return false;
  const token=decodeURIComponent(found.slice(COOKIE.length+1));
  const [payload,sig]=token.split('.');
  if(!payload||!sig)return false;
  const expected=sign(payload,secret);
  const a=Buffer.from(sig); const b=Buffer.from(expected);
  if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return false;
  try{return JSON.parse(Buffer.from(payload,'base64url').toString()).exp>Date.now()}catch{return false}
}
export function sessionCookie(token){return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ttl}`;}
export function clearCookie(){return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`}
export function json(status,body,headers={}){return {statusCode:status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers},body:JSON.stringify(body)}}
export {COOKIE};
