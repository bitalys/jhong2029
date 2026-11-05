import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Menu, X, ArrowUpRight, Plus, Pencil, Trash2, Star, Eye, EyeOff, LogOut, Lock, Search, Image as ImageIcon, Settings, LayoutDashboard, Trophy, FolderKanban, Tags, Upload, Copy, Check, ExternalLink, RefreshCw, ChevronRight } from 'lucide-react';
import './style.css';

const supabase = (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;

const demo = [
  { id:'1', slug:'2026-isb-splash', title:'ISB Splash Swimming Competition', category:{name:'Athletics',slug:'athletics'}, sport:{name:'Swimming',slug:'swimming'}, academic_year:'G10', event_date:'2026-03-12', excerpt:'A competition experience built around personal bests, discipline and learning to race with confidence.', content:'At the 2026 ISB Splash Swimming Competition in Bangkok, I focused on racing with intent and learning from every event.', reflection:'Progress is rarely one big moment. It is built through repetition, discipline and small gains.', featured:true, published:true },
  { id:'2', slug:'2024-john-locke-politics', title:'John Locke — Senior Politics', category:{name:'Ideas',slug:'ideas'}, academic_year:'G8', event_date:'2024-01-01', excerpt:'Merit Award in Senior Politics.', content:'Writing gave me a way to explore political questions beyond the classroom.', reflection:'The most useful questions are often the ones without easy answers.', featured:true, published:true },
  { id:'3', slug:'world-as-my-classroom', title:'The World as My Classroom', category:{name:'Projects',slug:'projects'}, academic_year:'G10', event_date:'2026-01-01', excerpt:'Travel as a way to observe cultures, cities, sports and communities.', content:'Travel has taught me to observe before I judge and to stay curious when something feels unfamiliar.', reflection:'Every new place gives me another perspective.', featured:true, published:true }
];

const nav = [['ABOUT','/about'],['ACADEMICS','/academics'],['IDEAS','/ideas'],['ATHLETICS','/athletics'],['PROJECTS','/projects'],['JOURNEY','/journey'],['CV','/cv']];
const fmt = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : '';

async function posts(filter={}) {
  if (!supabase) return demo.filter(p => (!filter.category || p.category?.slug === filter.category) && (!filter.sport || p.sport?.slug === filter.sport) && (!filter.featured || p.featured));
  let q = supabase.from('posts').select('*,category:categories(name,slug),sport:sports(name,slug)').eq('published',true).order('event_date',{ascending:false});
  if (filter.category) q = q.eq('category.slug',filter.category);
  if (filter.sport) q = q.eq('sport.slug',filter.sport);
  if (filter.featured) q = q.eq('featured',true);
  const {data,error} = await q;
  if (error) throw error;
  return data || [];
}

function Shell({children}) {
  const [open,setOpen] = useState(false);
  return <div className="site-shell">
    <header>
      <Link className="brand" to="/">JACKSON HONG<small>PORTFOLIO</small></Link>
      <button className="menub" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
      <nav className={open?'open':''}>{nav.map(([x,p])=><Link key={p} to={p} onClick={()=>setOpen(false)}>{x}</Link>)}<Link to="/admin" onClick={()=>setOpen(false)}><Lock size={13}/> ADMIN</Link></nav>
    </header>
    {children}
    <footer><b>JACKSON HONG</b><span>Student · Athlete · Writer · Explorer</span><span>© {new Date().getFullYear()}</span></footer>
  </div>;
}

function Home(){
  const [p,setP]=useState([]);
  useEffect(()=>{posts({featured:true}).then(setP).catch(()=>setP(demo.filter(x=>x.featured)))},[]);
  return <Shell>
    <section className="hero"><div><label>GRADE 10 · CHADWICK INTERNATIONAL SCHOOL · IB MYP</label><h1>JACKSON<br/>HONG</h1><p className="sub">Student · Athlete · Writer · Explorer</p><p className="quote">“Curious about the world. Driven to explore it.”</p><Link className="btn" to="/journey">EXPLORE MY JOURNEY <ArrowUpRight size={15}/></Link></div><div className="ph hero-photo">ADD HERO PHOTO</div></section>
    <section><label>WHO I AM</label><h2>MORE THAN A STUDENT.</h2><p className="lead">I am a Grade 10 student interested in history, politics, sport and the ways people and places shape one another.</p><p>Outside the classroom, I swim, play golf, write, travel, sketch and create stories through my own projects.</p></section>
    <section className="dark"><label>MY WORLD</label><div className="quad"><World a="THINK" b="History · Politics · Writing"/><World a="COMPETE" b="Swimming · Golf · Soccer"/><World a="EXPLORE" b="Travel · Culture · Languages"/><World a="CREATE" b="Video · Sketching · Design"/></div></section>
    <Feature title="FEATURED STORIES" p={p}/>
    <section><label>WHAT I'M CURIOUS ABOUT</label><h2>HISTORY · POLITICS · SPORT · SOCIETY · TRAVEL · DESIGN · CULTURE · MEDIA</h2></section>
    <section className="dark"><h2>KEEP EXPLORING.</h2><p className="lead">Ask better questions. Go further. Keep learning.</p></section>
  </Shell>;
}
function World({a,b}){return <article><small>{a}</small><h3>{b}</h3><p>Exploring questions, challenges and experiences beyond a single classroom.</p></article>}
function Feature({title,p}){return <section><div className="sectop"><label>{title}</label><Link to="/ideas">VIEW ALL →</Link></div><div className="cards">{p.slice(0,3).map(x=><Card key={x.id} p={x}/>)}</div></section>}
function Card({p}){return <Link className="card" to={'/post/'+p.slug}><div className="ph">{p.cover_image?<img src={p.cover_image} alt=""/>:p.category?.name?.toUpperCase()}</div><div className="pad"><small>{p.academic_year} · {fmt(p.event_date)}</small><h3>{p.title}</h3><p>{p.excerpt}</p><span className="read">READ <ArrowUpRight size={13}/></span></div></Link>}
function Listing({cat,title,ath=false}){
  const [p,setP]=useState([]),[s,setS]=useState('');
  useEffect(()=>{posts({category:cat,sport:s||undefined}).then(setP).catch(()=>setP(demo.filter(x=>x.category?.slug===cat)))},[cat,s]);
  return <Shell><div className="pagehero"><label>{cat.toUpperCase()}</label><h1>{title}</h1><p className="lead">{cat==='athletics'?'Swimming, golf and soccer have taught me discipline, resilience, patience and how to compete with myself.':'A growing archive of Jackson’s ideas, experiences and projects.'}</p>{ath&&<div className="filters">{['','swimming','golf','soccer'].map(x=><button key={x} className={s===x?'active':''} onClick={()=>setS(x)}>{x||'ALL'}</button>)}</div>}</div><section><div className="cards">{p.map(x=><Card key={x.id} p={x}/>)}</div></section></Shell>;
}
function Post(){
  const {slug}=useParams(); const [p,setP]=useState();
  useEffect(()=>{if(!supabase){setP(demo.find(x=>x.slug===slug));return}(async()=>{const {data}=await supabase.from('posts').select('*,category:categories(name,slug),sport:sports(name,slug)').eq('slug',slug).eq('published',true).single();setP(data)})()},[slug]);
  if(!p)return <Shell><section><h2>Not found.</h2></section></Shell>;
  return <Shell><article className="post"><label>{p.category?.name} {p.sport?.name&&'· '+p.sport.name}</label><h1>{p.title}</h1><small>{p.academic_year} · {fmt(p.event_date)}</small><div className="bigph">{p.cover_image?<img src={p.cover_image} alt=""/>:''}</div><div className="copy"><p className="lead">{p.excerpt}</p><p>{p.content}</p>{p.reflection&&<blockquote>{p.reflection}</blockquote>}{p.video_url&&<a className="btn" href={p.video_url} target="_blank" rel="noreferrer">WATCH VIDEO ↗</a>}</div></article></Shell>;
}
function Basic({title,children}){return <Shell><div className="pagehero"><label>JACKSON HONG</label><h1>{title}</h1></div><section className="narrow">{children}</section></Shell>}

async function adminFetch(url,options={}) {
  const headers = {...(options.body instanceof FormData ? {} : {'Content-Type':'application/json'}),...(options.headers||{})};
  const r = await fetch(url,{credentials:'include',...options,headers});
  let body={}; try{body=await r.json()}catch{}
  if(!r.ok) throw new Error(body.error || `Request failed (${r.status})`);
  return body;
}

function AdminLogin(){
  const [pin,setPin]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false); const nav=useNavigate();
  async function go(e){e.preventDefault();if(!pin.trim())return;setBusy(true);setErr('');try{await adminFetch('/api/admin-login',{method:'POST',body:JSON.stringify({pin})});nav('/admin',{replace:true})}catch(e){setErr(e.message)}finally{setBusy(false)}}
  return <div className="login"><div className="login-grid"><div className="login-copy"><span>JACKSON HONG</span><h1>THE<br/><em>BACK OFFICE.</em></h1><p>One private space for the stories, results, projects and milestones behind the portfolio.</p></div><form onSubmit={go}><div className="login-mark"><Lock size={18}/><span>PRIVATE CMS</span></div><h2>Welcome back.</h2><p className="loginhint">Enter the administrator PIN to continue.</p><input autoFocus inputMode="numeric" pattern="[0-9]*" maxLength="32" placeholder="••••" type="password" value={pin} onChange={e=>setPin(e.target.value)}/><button className="btn wide" disabled={busy}>{busy?'CHECKING…':'ENTER CMS'} <ArrowUpRight size={15}/></button>{err&&<div className="errorbox">{err}</div>}<small>Jackson Portfolio · Admin access</small></form></div></div>;
}

function Admin(){
  const nav=useNavigate();
  const [checking,setChecking]=useState(true),[ready,setReady]=useState(false),[tab,setTab]=useState('dashboard');
  const [data,setData]=useState([]),[cats,setCats]=useState([]),[sports,setSports]=useState([]),[settings,setSettings]=useState(null),[edit,setEdit]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const [query,setQuery]=useState('');
  useEffect(()=>{let live=true;adminFetch('/api/admin-session').then(()=>{if(live){setReady(true);setChecking(false)}}).catch(()=>{if(live){setReady(false);setChecking(false)}});return()=>{live=false}},[]);
  useEffect(()=>{if(ready)load()},[ready]);
  async function load(){try{const r=await adminFetch('/api/admin-api');setData(r.posts||[]);setCats(r.categories||[]);setSports(r.sports||[]);setSettings(r.settings||null);setError('')}catch(e){setError(e.message)}}
  async function signOut(){try{await fetch('/api/admin-logout',{method:'POST',credentials:'include'})}finally{nav('/admin',{replace:true})}}
  const published=data.filter(x=>x.published), featured=data.filter(x=>x.published&&x.featured), drafts=data.filter(x=>!x.published);
  const filtered=data.filter(x=>`${x.title} ${x.category?.name||''} ${x.sport?.name||''}`.toLowerCase().includes(query.toLowerCase()));
  if(checking)return <div className="login loading"><div><div className="spinner"></div><span>JACKSON PORTFOLIO</span><h1>ADMIN</h1><p>Checking your session…</p></div></div>;
  if(!ready)return <AdminLogin/>;
  const tabs=[['dashboard','Overview',LayoutDashboard],['posts','Posts',FolderKanban],['sports','Athletics',Trophy],['categories','Categories',Tags],['media','Media',ImageIcon],['settings','Homepage',Settings]];
  return <div className="admin-shell">
    <aside className="admin-side"><Link className="admin-brand" to="/"><b>JACKSON</b><span>HONG / CMS</span></Link><div className="side-label">WORKSPACE</div>{tabs.map(([k,v,Icon])=><button key={k} className={tab===k?'sel':''} onClick={()=>setTab(k)}><Icon size={16}/><span>{v}</span>{k==='posts'&&<i>{data.length}</i>}</button>)}<div className="side-bottom"><Link to="/" target="_blank"><ExternalLink size={15}/> View website</Link><button onClick={signOut}><LogOut size={15}/> Sign out</button></div></aside>
    <main className="admin-main">
      <div className="admin-top"><div><span className="eyebrow">JACKSON HONG / ADMIN</span><div className="admin-title-row"><h1>{tab==='dashboard'?'Overview':tabs.find(x=>x[0]===tab)?.[1]}</h1>{tab==='posts'&&<span className="live-pill">● LIVE CMS</span>}</div></div><div className="top-actions"><button className="icon-btn" title="Refresh" onClick={load}><RefreshCw size={16}/></button>{tab==='posts'&&<button className="btn" onClick={()=>setEdit({})}><Plus size={15}/> NEW POST</button>}</div></div>
      {error&&<div className="errorbar"><span>{error}</span><button onClick={load}>RETRY</button></div>}
      {notice&&<div className="successbar">{notice}</div>}
      {tab==='dashboard'&&<Dashboard data={data} published={published} featured={featured} drafts={drafts} setTab={setTab} setEdit={setEdit}/>} 
      {tab==='posts'&&<PostsManager rows={filtered} query={query} setQuery={setQuery} edit={setEdit} load={load} setNotice={setNotice}/>} 
      {tab==='sports'&&<Tax title="Athletics" description="Manage the sports that can be attached to posts." table="sports" rows={sports} load={load} setNotice={setNotice}/>} 
      {tab==='categories'&&<Tax title="Categories" description="Control the editorial sections of Jackson’s portfolio." table="categories" rows={cats} load={load} setNotice={setNotice}/>} 
      {tab==='media'&&<Media setNotice={setNotice}/>} 
      {tab==='settings'&&<SettingsPanel settings={settings} load={load} setNotice={setNotice}/>} 
      {edit&&<Editor item={edit} cats={cats} sports={sports} close={()=>setEdit(null)} load={load} setNotice={setNotice}/>} 
    </main>
  </div>;
}

function Dashboard({data,published,featured,drafts,setTab,setEdit}){
  const recent=[...data].sort((a,b)=>new Date(b.updated_at||0)-new Date(a.updated_at||0)).slice(0,5);
  return <div className="dashboard-wrap"><div className="welcome"><div><span className="eyebrow">PORTFOLIO CONTROL ROOM</span><h2>Build the story,<br/><em>one entry at a time.</em></h2><p>Keep Jackson’s G10–G12 journey in one place — ideas, athletics, projects, travel and achievements.</p></div><div className="dash-orbit"><span>THINK</span><span>COMPETE</span><span>EXPLORE</span><span>CREATE</span></div></div>
    <div className="stat-grid"><Stat n={data.length} label="Total posts"/><Stat n={published.length} label="Published"/><Stat n={featured.length} label="Homepage featured"/><Stat n={drafts.length} label="Drafts"/></div>
    <div className="dash-grid"><section className="panel"><div className="panel-head"><div><span className="eyebrow">RECENT ACTIVITY</span><h3>Latest posts</h3></div><button className="text-btn" onClick={()=>setTab('posts')}>ALL POSTS <ChevronRight size={14}/></button></div>{recent.length?recent.map(p=><div className="mini-post" key={p.id}><div className="mini-thumb">{p.cover_image?<img src={p.cover_image} alt=""/>:<span>{p.category?.name?.[0]||'J'}</span>}</div><div><b>{p.title}</b><small>{p.category?.name||'Uncategorised'} · {p.academic_year}</small></div><span className={p.published?'status live':'status'}>{p.published?'Published':'Draft'}</span></div>):<Empty text="No posts yet."/>}</section>
    <section className="panel quick"><span className="eyebrow">QUICK ACTIONS</span><h3>Make an update.</h3><button onClick={()=>setEdit({})}><Plus/> New post <ArrowUpRight/></button><button onClick={()=>setTab('media')}><ImageIcon/> Upload media <ArrowUpRight/></button><button onClick={()=>setTab('settings')}><Star/> Curate homepage <ArrowUpRight/></button></section></div>
  </div>;
}
function Stat({n,label}){return <div className="stat"><strong>{n}</strong><span>{label}</span></div>}
function Empty({text}){return <div className="empty">{text}</div>}

function PostsManager({rows,query,setQuery,edit,load,setNotice}){
  async function del(id){if(!confirm('Delete this post permanently?'))return;try{await adminFetch('/api/admin-api',{method:'POST',body:JSON.stringify({action:'delete',table:'posts',id})});setNotice('Post deleted.');load()}catch(e){alert(e.message)}}
  async function flip(id,k,v){try{await adminFetch('/api/admin-api',{method:'POST',body:JSON.stringify({action:'update',table:'posts',id,data:{[k]:!v,updated_at:new Date().toISOString()}})});setNotice(k==='featured'?(v?'Removed from homepage.':'Added to homepage.'):(!v?'Post published.':'Post moved to draft.'));load()}catch(e){alert(e.message)}}
  return <div className="manager"><div className="toolbar"><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search posts, sports, categories…"/></div><span>{rows.length} entries</span></div><div className="post-table"><div className="table-head"><span>STORY</span><span>TYPE</span><span>STATUS</span><span>HOMEPAGE</span><span>ACTIONS</span></div>{rows.length?rows.map(p=><div className="post-row" key={p.id}><div className="story-cell"><div className="table-thumb">{p.cover_image?<img src={p.cover_image} alt=""/>:<span>{p.category?.name?.[0]||'J'}</span>}</div><div><b>{p.title}</b><small>{p.academic_year} · {fmt(p.event_date)}</small></div></div><div><span className="tag">{p.category?.name||'—'}</span>{p.sport?.name&&<span className="tag soft">{p.sport.name}</span>}</div><div><span className={`status ${p.published?'live':''}`}>{p.published?'Published':'Draft'}</span></div><div><button className={`star-btn ${p.featured?'on':''}`} onClick={()=>flip(p.id,'featured',p.featured)} title="Toggle homepage feature"><Star size={16} fill={p.featured?'currentColor':'none'}/></button></div><div className="row-actions"><button onClick={()=>flip(p.id,'published',p.published)} title="Publish"><Eye size={16}/></button><button onClick={()=>edit(p)} title="Edit"><Pencil size={16}/></button><button onClick={()=>del(p.id)} title="Delete"><Trash2 size={16}/></button></div></div>):<Empty text="No matching posts."/>}</div></div>;
}

function Editor({item,cats,sports,close,load,setNotice}){
  const [f,setF]=useState({...item,category_id:item.category_id||'',sport_id:item.sport_id||'',tags:(item.tags||[]).join(', ')}); const [busy,setBusy]=useState(false);
  const set=(k,v)=>setF(x=>({...x,[k]:v}));
  async function save(e){e.preventDefault();setBusy(true);let x={...f,tags:f.tags?f.tags.split(',').map(v=>v.trim()).filter(Boolean):[],updated_at:new Date().toISOString()};delete x.id;delete x.category;delete x.sport;if(!x.slug)x.slug=(x.title||'untitled').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');try{await adminFetch('/api/admin-api',{method:'POST',body:JSON.stringify({action:item.id?'update':'create',table:'posts',id:item.id,data:x})});close();setNotice(item.id?'Post updated.':'New post created.');load()}catch(e){alert(e.message)}finally{setBusy(false)}}
  return <div className="modal"><form className="editor" onSubmit={save}><div className="editor-head"><div><span className="eyebrow">{item.id?'EDIT STORY':'NEW STORY'}</span><h2>{item.id?'Shape the story.':'Add something worth remembering.'}</h2></div><button type="button" className="close-btn" onClick={close}><X/></button></div><div className="editor-grid"><div className="editor-main"><Field label="Title"><input value={f.title||''} onChange={e=>set('title',e.target.value)} required placeholder="e.g. ISB Splash Swimming Competition"/></Field><div className="two"><Field label="Category"><select value={f.category_id||''} onChange={e=>set('category_id',e.target.value)}><option value="">Select category</option>{cats.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Sport"><select value={f.sport_id||''} onChange={e=>set('sport_id',e.target.value)}><option value="">Not athletics</option>{sports.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field></div><div className="two"><Field label="Academic year"><input value={f.academic_year||''} onChange={e=>set('academic_year',e.target.value)} placeholder="G10"/></Field><Field label="Date"><input type="date" value={f.event_date||''} onChange={e=>set('event_date',e.target.value)}/></Field></div><Field label="Excerpt"><textarea value={f.excerpt||''} onChange={e=>set('excerpt',e.target.value)} placeholder="The short version shown on cards and the homepage."/></Field><Field label="Story"><textarea className="tall" value={f.content||''} onChange={e=>set('content',e.target.value)} placeholder="Write the full story here…"/></Field><Field label="Reflection"><textarea value={f.reflection||''} onChange={e=>set('reflection',e.target.value)} placeholder="What did this experience teach you?"/></Field></div><div className="editor-side"><div className="side-card"><span className="eyebrow">PUBLISHING</span><label className="switchline"><input type="checkbox" checked={!!f.published} onChange={e=>set('published',e.target.checked)}/><span><b>Published</b><small>Visible in the public archive.</small></span></label><label className="switchline"><input type="checkbox" checked={!!f.featured} onChange={e=>set('featured',e.target.checked)}/><span><b>Homepage feature</b><small>Show this story in Featured Stories.</small></span></label></div><div className="side-card"><span className="eyebrow">MEDIA</span><Field label="Cover image URL"><input value={f.cover_image||''} onChange={e=>set('cover_image',e.target.value)} placeholder="https://…"/></Field><Field label="Video URL"><input value={f.video_url||''} onChange={e=>set('video_url',e.target.value)} placeholder="YouTube / Vimeo URL"/></Field><Field label="Tags"><input value={f.tags||''} onChange={e=>set('tags',e.target.value)} placeholder="swimming, competition, Bangkok"/></Field></div></div></div><div className="editor-foot"><button type="button" onClick={close}>Cancel</button><button className="btn" disabled={busy}>{busy?'SAVING…':'SAVE STORY'} <Check size={15}/></button></div></form></div>;
}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}

function Tax({title,description,table,rows,load,setNotice}){
  const[n,setN]=useState('');
  async function add(){if(!n.trim())return;try{await adminFetch('/api/admin-api',{method:'POST',body:JSON.stringify({action:'create',table,data:{name:n.trim(),slug:n.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-'),sort_order:rows.length+1}})});setN('');setNotice(`${title.slice(0,-1)||title} added.`);load()}catch(e){alert(e.message)}}
  async function del(id){if(!confirm('Delete this item? Posts will keep their content but lose this label.'))return;try{await adminFetch('/api/admin-api',{method:'POST',body:JSON.stringify({action:'delete',table,id})});setNotice('Item deleted.');load()}catch(e){alert(e.message)}}
  return <div className="taxonomy"><div className="section-intro"><div><span className="eyebrow">TAXONOMY</span><h2>{title}</h2><p>{description}</p></div></div><div className="add-card"><input value={n} onChange={e=>setN(e.target.value)} placeholder={`Add a new ${title.toLowerCase().replace(/s$/,'')}…`} onKeyDown={e=>e.key==='Enter'&&add()}/><button className="btn" onClick={add}><Plus size={15}/> ADD</button></div><div className="tax-list">{rows.map((r,i)=><div className="tax-row" key={r.id}><span className="num">{String(i+1).padStart(2,'0')}</span><div><b>{r.name}</b><small>/{r.slug}</small></div><button onClick={()=>del(r.id)}><Trash2 size={16}/></button></div>)}</div></div>;
}

function Media({setNotice}){
  const [files,setFiles]=useState([]),[busy,setBusy]=useState(false),[copied,setCopied]=useState('');
  const load=async()=>{try{const r=await adminFetch('/api/admin-media');setFiles(r.files||[])}catch(e){alert(e.message)}};
  useEffect(()=>{load()},[]);
  async function upload(e){const file=e.target.files?.[0];if(!file)return; if(file.size>8*1024*1024){alert('Please keep images under 8 MB.');return}setBusy(true);try{const base64=await fileToBase64(file);const data=base64.split(',')[1];await adminFetch('/api/admin-media-upload',{method:'POST',body:JSON.stringify({fileName:file.name,mimeType:file.type,base64:data})});setNotice('Image uploaded.');load()}catch(e){alert(e.message)}finally{setBusy(false);e.target.value=''}}
  async function remove(name){if(!confirm('Delete this file?'))return;try{await adminFetch('/api/admin-media',{method:'DELETE',body:JSON.stringify({name})});load()}catch(e){alert(e.message)}}
  async function copy(url){await navigator.clipboard?.writeText(url);setCopied(url);setTimeout(()=>setCopied(''),1200)}
  return <div className="media-page"><div className="section-intro"><div><span className="eyebrow">MEDIA LIBRARY</span><h2>Images that tell the story.</h2><p>Upload portfolio photography once, then reuse the public URL in any post.</p></div><label className="btn upload-btn"><Upload size={15}/>{busy?'UPLOADING…':'UPLOAD IMAGE'}<input type="file" accept="image/*" onChange={upload} disabled={busy}/></label></div><div className="media-grid">{files.length?files.map(f=><div className="media-card" key={f.name}><img src={f.url} alt=""/><div><b>{f.name}</b><div className="media-actions"><button onClick={()=>copy(f.url)}>{copied===f.url?<Check size={14}/>:<Copy size={14}/>} {copied===f.url?'COPIED':'COPY URL'}</button><button onClick={()=>remove(f.name)}><Trash2 size={14}/> DELETE</button></div></div></div>):<Empty text="No uploaded media yet."/>}</div></div>;
}
function fileToBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}

function SettingsPanel({settings,load,setNotice}){
  const [f,setF]=useState(settings||{}),[busy,setBusy]=useState(false);
  useEffect(()=>setF(settings||{}),[settings]);
  async function save(e){e.preventDefault();setBusy(true);try{await adminFetch('/api/admin-api',{method:'POST',body:JSON.stringify({action:'update',table:'site_settings',id:f.id,data:{current_grade:f.current_grade,school:f.school,hero_title:f.hero_title,hero_subtitle:f.hero_subtitle,hero_statement:f.hero_statement}})});setNotice('Homepage settings saved.');load()}catch(e){alert(e.message)}finally{setBusy(false)}}
  return <div className="settings-page"><div className="section-intro"><div><span className="eyebrow">HOMEPAGE</span><h2>Control the first impression.</h2><p>Keep the public homepage current without touching the code.</p></div></div><form className="settings-card" onSubmit={save}><div className="two"><Field label="Current grade"><input value={f.current_grade||''} onChange={e=>setF({...f,current_grade:e.target.value})}/></Field><Field label="School"><input value={f.school||''} onChange={e=>setF({...f,school:e.target.value})}/></Field></div><Field label="Hero title"><input value={f.hero_title||''} onChange={e=>setF({...f,hero_title:e.target.value})}/></Field><Field label="Hero subtitle"><input value={f.hero_subtitle||''} onChange={e=>setF({...f,hero_subtitle:e.target.value})}/></Field><Field label="Hero statement"><textarea value={f.hero_statement||''} onChange={e=>setF({...f,hero_statement:e.target.value})}/></Field><div className="editor-foot"><span>Changes update the stored site settings.</span><button className="btn" disabled={busy}>{busy?'SAVING…':'SAVE SETTINGS'}</button></div></form></div>;
}

function App(){return <Routes><Route path="/" element={<Home/>}/><Route path="/ideas" element={<Listing cat="ideas" title="Ideas"/>}/><Route path="/athletics" element={<Listing cat="athletics" title="Athletics" ath/>}/><Route path="/projects" element={<Listing cat="projects" title="Projects"/>}/><Route path="/post/:slug" element={<Post/>}/><Route path="/about" element={<Basic title="More Than a Student."><p className="lead">History, politics, sport, travel and the ways people and places shape one another.</p></Basic>}/><Route path="/academics" element={<Basic title="Learning Beyond the Classroom."><p className="lead">History, politics, social sciences, languages and design are central to the questions I want to explore.</p></Basic>}/><Route path="/journey" element={<Basic title="Every Experience Changes the Next One."><div className="timeline">{[['Age 4','Swimming begins'],['2018','Junior Golf'],['2024','John Locke Politics — Merit Award'],['2025','John Locke History — Commendation Award'],['2026','Grade 10 · IB MYP'],['NEXT','IB Diploma Programme']].map(x=><div className="trow" key={x[0]}><b>{x[0]}</b><span>{x[1]}</span></div>)}</div></Basic>}/><Route path="/cv" element={<Basic title="Jackson Hong."><p className="lead">Student · Athlete · Writer · Explorer</p><p>Add the verified CV PDF to the public folder when ready.</p></Basic>}/><Route path="/admin" element={<Admin/>}/></Routes>}

createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
