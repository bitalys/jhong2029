# Jackson Hong Portfolio CMS

React + Vite + Supabase + Netlify Functions portfolio CMS.

## Admin login

The admin page uses a PIN only — no username/email field.

Initial PIN: `1111`

For security, the PIN is **not** hard-coded into the browser bundle. Set it in Netlify:

- `ADMIN_PIN=1111`
- `ADMIN_SESSION_SECRET=<long random secret>`
- `SUPABASE_URL=<your Supabase URL>`
- `SUPABASE_SERVICE_ROLE_KEY=<your Supabase service role key>`
- `VITE_SUPABASE_URL=<your Supabase URL>`
- `VITE_SUPABASE_ANON_KEY=<your Supabase anon key>`

The Service Role Key must only exist in Netlify server-side environment variables.

## Important

The `/admin` route first checks the existing session. If no valid session exists, it now correctly shows the PIN login screen instead of repeatedly redirecting back to `/admin` while displaying “Checking session…”.
