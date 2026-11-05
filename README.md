# Jackson Hong Portfolio — Simple CMS

A Netlify-only portfolio CMS. No Supabase, SQL, RLS, API keys, or database setup is required.

## Setup
1. Deploy this project to Netlify.
2. Add one environment variable: `ADMIN_PIN=1111`.
3. Open `/admin` and enter 1111.
4. Use Posts, Athletics, Categories, Media and Homepage to manage the site.

Data is persisted with Netlify Blobs, so changes survive redeploys. Netlify Blobs is provisioned automatically for Functions; no separate database is required.
