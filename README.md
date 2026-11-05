# Jackson Hong Portfolio CMS

This is the proposed long-term architecture: React/Vite on Netlify + Supabase Auth/Database/Storage.

## What it does
- Public editorial portfolio
- Admin login at `/admin`
- Create/edit/delete posts
- Draft vs Published
- Featured vs non-featured
- Athletics taxonomy: Swimming / Golf / Soccer
- Category management
- Image upload to Supabase Storage
- Post detail pages
- Homepage automatically shows Published + Featured posts
- Academic year field so G10/G11/G12 can coexist

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Create one admin user in Supabase Authentication.
4. Copy `.env.example` to `.env` and add the project URL + anon key.
5. `npm install && npm run dev`.
6. Connect GitHub repo to Netlify. Build: `npm run build`; Publish: `dist`.
7. Add the two VITE environment variables in Netlify.

## Recommended production hardening
The sample RLS currently gives authenticated users broad write access to simplify the first setup. Before launch, restrict write policies to your admin user(s). The next UI refinement should add a visual media picker, drag-and-drop gallery, rich text editor, homepage drag-and-drop ordering, and separate Awards/Timeline editors.


## Admin login
The admin page uses a PIN-only login. The initial PIN is `1111` when `ADMIN_PIN=1111` is configured in Netlify. The PIN is checked by a Netlify server function and is not bundled into the browser code. Also set `ADMIN_SESSION_SECRET`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` as Netlify environment variables.
