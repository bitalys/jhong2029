import crypto from 'node:crypto';
import { mediaStore, json, requireAdmin } from './_shared.mjs';

export default async function handler(request){
  try{
    if(request.method==='GET'){
      const url=new URL(request.url); const key=url.searchParams.get('key');
      if(key){
        const blob=await mediaStore().get(key,{type:'blob'});
        if(!blob) return new Response('Not found',{status:404});
        return new Response(blob);
      }
      const {blobs}=await mediaStore().list({prefix:'media/'});
      const files=[];
      for(const b of blobs){
        const meta=await mediaStore().getMetadata(b.key);
        files.push({key:b.key,name:b.key.replace(/^media\//,''),url:`/api/media?key=${encodeURIComponent(b.key)}`,contentType:meta?.metadata?.contentType||'image/*'});
      }
      return json({files});
    }
    const denied=requireAdmin(request); if(denied) return denied;
    if(request.method==='DELETE'){
      const {key}=await request.json(); if(!key?.startsWith('media/')) return json({error:'Invalid media key.'},400);
      await mediaStore().delete(key); return json({ok:true});
    }
    if(request.method==='POST'){
      const ct=request.headers.get('content-type')||'';
      if(!ct.includes('multipart/form-data')) return json({error:'Please upload an image file.'},400);
      const form=await request.formData(); const file=form.get('file');
      if(!file || typeof file.arrayBuffer!=='function') return json({error:'No image file received.'},400);
      if(!file.type.startsWith('image/')) return json({error:'Only image files are allowed.'},400);
      if(file.size>8*1024*1024) return json({error:'Please keep images under 8 MB.'},400);
      const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
      const key=`media/${Date.now()}-${crypto.randomUUID()}.${ext||'jpg'}`;
      await mediaStore().set(key,await file.arrayBuffer(),{metadata:{contentType:file.type,originalName:file.name}});
      return json({file:{key,name:file.name,url:`/api/media?key=${encodeURIComponent(key)}`,contentType:file.type}});
    }
    return json({error:'Method not allowed'},405);
  }catch(e){ return json({error:e.message||'Media request failed.'},500); }
}
