import { createClient } from '@supabase/supabase-js';
import { validSession, json } from './_auth.mjs';

const BUCKET = 'portfolio-media';
const getUrl = () => process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const getKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async function handler(event) {
  if (!validSession(event, process.env.ADMIN_SESSION_SECRET || '')) return json(401, { error: 'Admin session expired. Please sign in again.' });
  if (!getUrl() || !getKey()) return json(500, { error: 'Media backend is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  if (!event.body) return json(400, { error: 'No file received.' });

  const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
  if (!contentType.includes('application/json')) {
    return json(400, { error: 'This uploader expects a base64 JSON payload.' });
  }

  try {
    const { fileName, mimeType, base64 } = JSON.parse(event.body);
    if (!fileName || !base64) return json(400, { error: 'File name and data are required.' });
    const bytes = Buffer.from(base64, 'base64');
    if (bytes.length > 8 * 1024 * 1024) return json(400, { error: 'Please keep images under 8 MB.' });
    const safe = fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
    const path = `${Date.now()}-${safe}`;
    const supabase = createClient(getUrl(), getKey(), { auth: { persistSession: false, autoRefreshToken: false } });
    const result = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: mimeType || 'application/octet-stream', upsert: false });
    if (result.error) throw result.error;
    const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    return json(200, { ok: true, name: path, url });
  } catch (e) {
    return json(500, { error: e?.message || 'Upload failed.' });
  }
}
