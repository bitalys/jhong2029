import { getContent, enrich, json } from './_shared.mjs';
export default async function handler(){ try{return json(enrich(await getContent()))}catch(e){return json({error:e.message||'Could not load portfolio data.'},500)} }
