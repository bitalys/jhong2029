# Jackson Hong Portfolio — Editorial CMS

A GitHub / Netlify-ready React portfolio for Jackson Hong.

## Design
Editorial, high-density portfolio layout inspired by the original Jackson Portfolio concept: large typography, strong grids, dark editorial panels, featured stories, archive lists, athletics, journey and curiosity sections.

## Admin
- `/admin`
- PIN-only login
- Default PIN: `1111`
- Posts: create / edit / delete / publish / featured
- Athletics: manage sports
- Categories: manage categories
- Media: upload / copy / delete images
- Homepage: edit hero and profile settings

## Data
Uses Netlify Blobs. No Supabase setup is required.

## Netlify
Optional environment variable:

`ADMIN_PIN=1111`

If omitted, the built-in fallback PIN is `1111`.

## Local
```bash
npm install
npm run dev
```
