import { json, validSession } from './_shared.mjs';
export default async function handler(request){ return json({authenticated:validSession(request)}); }
