import { createClient } from '@supabase/supabase-js';
import { validSession, json } from './_auth.mjs';

const BUCKET = 'portfolio-media';
const getUrl = () => process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const getKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const db = () => createClient(getUrl(), getKey(), { auth: { persistSession: false, autoRefreshToken: false } });

function safeName(name = 'image') {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-');
}

export default async function handler(event) {
  if (!validSession(event, process.env.ADMIN_SESSION_SECRET || '')) return json(401, { error: 'Admin session expired. Please sign in again.' });
  if (!getUrl() || !getKey()) return json(500, { error: 'Media backend is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify.' });
  const supabase = db();

  try {
    if (event.httpMethod === 'GET') {
      const result = await supabase.storage.from(BUCKET).list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      if (result.error) throw result.error;
      const files = (result.data || []).map(file => ({
        name: file.name,
        created_at: file.created_at,
        url: supabase.storage.from(BUCKET).getPublicUrl(file.name).data.publicUrl
      }));
      return json(200, { files });
    }
    if (event.httpMethod !== 'DELETE') return json(405, { error: 'Method not allowed.' });
    const body = JSON.parse(event.body || '{}');
    if (!body.name) return json(400, { error: 'Media name is required.' });
    const result = await supabase.storage.from(BUCKET).remove([body.name]);
    if (result.error) throw result.error;
    return json(200, { ok: true });
  } catch (e) {
    return json(500, { error: e?.message || 'Media request failed.' });
  }
}
