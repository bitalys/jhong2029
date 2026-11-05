import {validSession,json} from './_auth.mjs';
export default async function handler(event){return validSession(event,process.env.ADMIN_SESSION_SECRET||'')?json(200,{authenticated:true}):json(401,{authenticated:false})}
