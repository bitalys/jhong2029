import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

export const DATA_STORE = 'jackson-portfolio';
export const MEDIA_STORE = 'jackson-media';
export const DATA_KEY = 'content';

export const seed = {
  settings: {
    current_grade: 'G10',
    school: 'Chadwick International School',
    hero_title: 'JACKSON HONG',
    hero_subtitle: 'Student · Athlete · Writer · Explorer',
    hero_statement: 'Curious about the world. Driven to explore it.',
    hero_image: ''
  },
  categories: [
    { id:'cat-ideas', name:'Ideas', slug:'ideas', description:'Essays, research, reflections and questions.' },
    { id:'cat-athletics', name:'Athletics', slug:'athletics', description:'Swimming, golf and soccer.' },
    { id:'cat-projects', name:'Projects', slug:'projects', description:'Creative and independent projects.' },
    { id:'cat-journey', name:'Journey', slug:'journey', description:'Travel, programs, school and experiences.' }
  ],
  sports: [
    { id:'sport-swimming', name:'Swimming', slug:'swimming' },
    { id:'sport-golf', name:'Golf', slug:'golf' },
    { id:'sport-soccer', name:'Soccer', slug:'soccer' }
  ],
  posts: [
    { id:'post-isb', slug:'2026-isb-splash', title:'ISB Splash Swimming Competition', category_id:'cat-athletics', sport_id:'sport-swimming', academic_year:'G10', event_date:'2026-03-12', excerpt:'A competition experience built around personal bests, discipline and learning to race with confidence.', content:'At the 2026 ISB Splash Swimming Competition in Bangkok, I focused on racing with intent and learning from every event.', reflection:'Progress is rarely one big moment. It is built through repetition, discipline and small gains.', cover_image:'', video_url:'', tags:['swimming','competition','Bangkok'], featured:true, published:true },
    { id:'post-locke', slug:'2024-john-locke-politics', title:'John Locke — Senior Politics', category_id:'cat-ideas', sport_id:'', academic_year:'G8', event_date:'2024-01-01', excerpt:'Merit Award in Senior Politics.', content:'Writing gave me a way to explore political questions beyond the classroom.', reflection:'The most useful questions are often the ones without easy answers.', cover_image:'', video_url:'', tags:['writing','politics','John Locke'], featured:true, published:true },
    { id:'post-world', slug:'world-as-my-classroom', title:'The World as My Classroom', category_id:'cat-projects', sport_id:'', academic_year:'G10', event_date:'2026-01-01', excerpt:'Travel as a way to observe cultures, cities, sports and communities.', content:'Travel has taught me to observe before I judge and to stay curious when something feels unfamiliar.', reflection:'Every new place gives me another perspective.', cover_image:'', video_url:'', tags:['travel','culture','exploration'], featured:true, published:true }
  ]
};

export function store(){ return getStore(DATA_STORE); }
export function mediaStore(){ return getStore(MEDIA_STORE); }

export async function getContent(){
  const s = store();
  const data = await s.get(DATA_KEY,{type:'json',consistency:'strong'});
  if(data) return data;
  await s.setJSON(DATA_KEY, seed);
  return structuredClone(seed);
}
export async function saveContent(data){ await store().setJSON(DATA_KEY,data); return data; }

export function json(data,status=200,headers={}){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});
}

function secret(){ return process.env.ADMIN_PIN || '1111'; }
function b64(v){ return Buffer.from(v).toString('base64url'); }
function unb64(v){ return Buffer.from(v,'base64url').toString('utf8'); }
function signature(payload){ return crypto.createHmac('sha256',secret()+'|jackson-portfolio-session').update(payload).digest('base64url'); }
export function makeSession(){
  const payload = b64(JSON.stringify({exp:Date.now()+7*24*60*60*1000,nonce:crypto.randomBytes(12).toString('hex')}));
  return payload+'.'+signature(payload);
}
export function validSession(request){
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)jackson_admin=([^;]+)/);
  if(!m) return false;
  const [payload,sig] = m[1].split('.');
  if(!payload || !sig || signature(payload)!==sig) return false;
  try { return JSON.parse(unb64(payload)).exp > Date.now(); } catch { return false; }
}
export function requireAdmin(request){ if(!validSession(request)) return json({error:'Admin session expired. Please sign in again.'},401); return null; }
export const loginCookie = token => `jackson_admin=${token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`;
export const clearCookie = 'jackson_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax';
export function slugify(s=''){ return s.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'story'; }
export function enrich(data){
  const cats = Object.fromEntries(data.categories.map(x=>[x.id,x]));
  const sports = Object.fromEntries(data.sports.map(x=>[x.id,x]));
  return {...data,posts:data.posts.map(p=>({...p,category:cats[p.category_id]||null,sport:sports[p.sport_id]||null}))};
}
