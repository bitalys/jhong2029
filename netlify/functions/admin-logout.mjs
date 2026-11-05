import {clearCookie,json} from './_auth.mjs';
export default async function handler(event){return json(200,{ok:true},{'Set-Cookie':clearCookie()})}
