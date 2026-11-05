import {makeSession,sessionCookie,json} from './_auth.mjs';
export default async function handler(event){
  if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
  const pin=JSON.parse(event.body||'{}').pin||'';
  if(!process.env.ADMIN_PIN||!process.env.ADMIN_SESSION_SECRET)return json(500,{error:'Admin environment variables are not configured.'});
  if(pin!==process.env.ADMIN_PIN)return json(401,{error:'Incorrect PIN.'});
  return json(200,{ok:true},{'Set-Cookie':sessionCookie(makeSession(process.env.ADMIN_SESSION_SECRET))});
}
