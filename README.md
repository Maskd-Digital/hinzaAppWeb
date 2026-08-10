# Hinza Complaints (Web)

Web rebuild of the Flutter **Hinza Complaints** mobile app (`complaintsv2`), targeting the same backend:

- REST reads: `https://hinza.vercel.app` (`GET /api/...`)
- Auth + complaint **inserts** + Storage uploads: Supabase (browser anon key + RLS)

Styling matches the existing Hinza System Admin dashboard (deep blue sidebar, white cards, light gray page background).

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and fill Supabase values from the same project as the mobile app:

```bash
cp .env.example .env.local
```

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL=/hinza-api` (browser calls this Next.js rewrite; **do not** point the browser at `https://hinza.vercel.app` directly — CORS will block it)
- `API_BASE_URL=https://hinza.vercel.app` (server-side rewrite target)

**Never** put the Supabase `service_role` key in this app.

3. Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Restart `npm run dev` after changing `next.config.ts` or env vars used by rewrites.

## Routes

| Path | Screen |
|------|--------|
| `/` | Splash → login |
| `/login` | Email/password (Supabase) |
| `/profile-required` | Retry company profile / logout |
| `/home` | Complaint origin picker |
| `/origin-type` | Product vs Equipment (Retail skips) |
| `/new-complaint` | Product 2-step wizard |
| `/complaint-summary` | Post-submit summary + PDF download |
| `/complaints-list` | Submitted product complaints |
| `/equipment` | Facility list for equipment |
| `/equipment-form` | Equipment image + description |

## Behaviour notes (parity with mobile)

- Retail goes straight to the product wizard
- Complaints are **inserted via Supabase**, not REST POST
- Photos upload to Storage bucket `complaints` as `{ stage, path }` in `custom_fields`
- Submitted list filters to `product_id != null` (equipment excluded)
- App requires network (offline gate)

See `MOBILE_APP_SPEC.md` for the full specification.
