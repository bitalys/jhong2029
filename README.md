# Jackson Hong Portfolio CMS

Editorial portfolio site + private PIN-protected CMS.

## Admin login
- URL: `/admin`
- ID: none
- Initial PIN: `1111`

The PIN is checked in a Netlify Function and is not hard-coded into the browser bundle.

## Netlify environment variables
Set these in Netlify → Project configuration → Environment variables:

- `ADMIN_PIN=1111`
- `ADMIN_SESSION_SECRET=` a long random secret
- `SUPABASE_URL=` your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY=` your Supabase service-role key (server only)
- `VITE_SUPABASE_URL=` your Supabase project URL
- `VITE_SUPABASE_ANON_KEY=` your Supabase anon key

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit it to GitHub.

## Supabase
Run `supabase/schema.sql` once in the Supabase SQL Editor. The schema creates the portfolio tables and the `portfolio-media` storage bucket.

## Admin features
- Dashboard overview
- Posts: create, edit, delete, publish/unpublish, homepage featured toggle, search
- Athletics: manage sports
- Categories: manage categories
- Media: upload/copy/delete portfolio images
- Homepage: edit hero/site settings
- PIN-only private admin session
