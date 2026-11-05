import { createClient } from '@supabase/supabase-js';
import { validSession, json } from './_auth.mjs';

const allowed = new Set(['posts', 'categories', 'sports', 'site_settings']);
const getUrl = () => process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const getKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const db = () => createClient(getUrl(), getKey(), { auth: { persistSession: false, autoRefreshToken: false } });

function slugify(value = '') {
  return value.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default async function handler(event) {
  if (!validSession(event, process.env.ADMIN_SESSION_SECRET || '')) return json(401, { error: 'Admin session expired. Please sign in again.' });
  const url = getUrl();
  const key = getKey();
  if (!url || !key) {
    return json(500, {
      error: 'CMS backend is not configured. In Netlify, add SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.'
    });
  }

  const supabase = db();
  try {
    if (event.httpMethod === 'GET') {
      const [posts, categories, sports, settings] = await Promise.all([
        supabase.from('posts').select('*,category:categories(name,slug),sport:sports(name,slug)').order('updated_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('sports').select('*').order('sort_order', { ascending: true }),
        supabase.from('site_settings').select('*').limit(1).maybeSingle()
      ]);
      for (const r of [posts, categories, sports, settings]) if (r.error) throw r.error;
      return json(200, {
        posts: posts.data || [],
        categories: categories.data || [],
        sports: sports.data || [],
        settings: settings.data || null
      });
    }

    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
    let payload;
    try { payload = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Invalid JSON request.' }); }
    const { action, table, id } = payload;
    let data = payload.data || {};
    if (!allowed.has(table)) return json(400, { error: 'Invalid table.' });

    if (table === 'site_settings') {
      const existing = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
      if (existing.error) throw existing.error;
      if (action === 'update') {
        const targetId = id || existing.data?.id;
        if (!targetId) return json(400, { error: 'Site settings record was not found.' });
        const result = await supabase.from('site_settings').update({ ...data, updated_at: new Date().toISOString() }).eq('id', targetId).select().single();
        if (result.error) throw result.error;
        return json(200, { ok: true, data: result.data });
      }
      return json(400, { error: 'Only update is supported for site settings.' });
    }

    if (action === 'create') {
      if ((table === 'categories' || table === 'sports') && !data.slug) data.slug = slugify(data.name);
      const result = await supabase.from(table).insert(data).select().single();
      if (result.error) throw result.error;
      return json(200, { ok: true, data: result.data });
    }
    if (action === 'update') {
      const result = await supabase.from(table).update(data).eq('id', id).select().single();
      if (result.error) throw result.error;
      return json(200, { ok: true, data: result.data });
    }
    if (action === 'delete') {
      const result = await supabase.from(table).delete().eq('id', id);
      if (result.error) throw result.error;
      return json(200, { ok: true });
    }
    return json(400, { error: 'Invalid action.' });
  } catch (e) {
    return json(500, { error: e?.message || 'Supabase request failed.' });
  }
}
