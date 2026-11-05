import {createClient} from '@supabase/supabase-js';
import {validSession,json} from './_auth.mjs';

const allowed=new Set(['posts','categories','sports']);
const db=()=>createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});

export default async function handler(event){
  if(!validSession(event,process.env.ADMIN_SESSION_SECRET||''))return json(401,{error:'Admin session expired.'});
  if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return json(500,{error:'Supabase server environment variables are not configured.'});
  const supabase=db();
  try{
    if(event.httpMethod==='GET'){
      const [posts,categories,sports]=await Promise.all([
        supabase.from('posts').select('*,category:categories(name,slug),sport:sports(name,slug)').order('updated_at',{ascending:false}),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('sports').select('*').order('sort_order')
      ]);
      for(const r of [posts,categories,sports])if(r.error)throw r.error;
      return json(200,{posts:posts.data||[],categories:categories.data||[],sports:sports.data||[]});
    }
    if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
    const {action,table,id,data={}}=JSON.parse(event.body||'{}');
    if(!allowed.has(table))return json(400,{error:'Invalid table.'});
    let result;
    if(action==='create')result=await supabase.from(table).insert(data).select().single();
    else if(action==='update')result=await supabase.from(table).update(data).eq('id',id).select().single();
    else if(action==='delete')result=await supabase.from(table).delete().eq('id',id);
    else return json(400,{error:'Invalid action.'});
    if(result.error)throw result.error;
    return json(200,{ok:true,data:result.data||null});
  }catch(e){return json(500,{error:e.message||'Server error'});}
}
