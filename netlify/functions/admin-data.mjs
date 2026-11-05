import crypto from 'node:crypto';
import { getContent, saveContent, enrich, json, requireAdmin, slugify } from './_shared.mjs';
export default async function handler(request){
  const denied=requireAdmin(request); if(denied) return denied;
  try{
    const method=request.method;
    const url=new URL(request.url);
    const action=url.searchParams.get('action') || '';
    let data=await getContent();
    if(method==='GET') return json(enrich(data));
    const body=await request.json();
    if(action==='save-post'){
      const post={...body};
      post.id=post.id || crypto.randomUUID();
      post.slug=slugify(post.slug || post.title);
      post.tags=Array.isArray(post.tags)?post.tags:String(post.tags||'').split(',').map(x=>x.trim()).filter(Boolean);
      const i=data.posts.findIndex(x=>x.id===post.id);
      if(i>=0) data.posts[i]={...data.posts[i],...post}; else data.posts.unshift(post);
    } else if(action==='delete-post'){
      data.posts=data.posts.filter(x=>x.id!==body.id);
    } else if(action==='save-settings'){
      data.settings={...data.settings,...body.settings};
    } else if(action==='add-category'){
      const name=String(body.name||'').trim(); if(!name) return json({error:'Category name is required.'},400);
      data.categories.push({id:crypto.randomUUID(),name,slug:slugify(name),description:''});
    } else if(action==='delete-category'){
      data.categories=data.categories.filter(x=>x.id!==body.id); data.posts=data.posts.map(p=>p.category_id===body.id?{...p,category_id:''}:p);
    } else if(action==='add-sport'){
      const name=String(body.name||'').trim(); if(!name) return json({error:'Sport name is required.'},400);
      data.sports.push({id:crypto.randomUUID(),name,slug:slugify(name)});
    } else if(action==='delete-sport'){
      data.sports=data.sports.filter(x=>x.id!==body.id); data.posts=data.posts.map(p=>p.sport_id===body.id?{...p,sport_id:''}:p);
    } else { return json({error:'Unknown action.'},400); }
    await saveContent(data);
    return json(enrich(data));
  }catch(e){ return json({error:e.message||'Could not save your changes.'},500); }
}
