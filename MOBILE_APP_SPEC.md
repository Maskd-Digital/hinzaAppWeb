# Mobile App Spec — Hinza Complaints (Flutter → Web)

Specification for rebuilding this Flutter mobile app as a **web application**.  
Documented from the current codebase only. Items that cannot be confirmed are marked **UNKNOWN**.

**App package:** `complaintsv2`  
**Default API:** `https://hinza.vercel.app` (`AppConfig.apiBaseUrl`)  
**Default Supabase project URL:** set via `SUPABASE_URL` / hardcoded default in `lib/app/config.dart`

---

## Summary

Company-scoped app for employees to file and review complaints:

- **Product complaints** — multi-step wizard driven by backend templates
- **Equipment complaints** — facility by origin, one image + description
- **Submitted list** — paginated product complaints with search/status filter

Auth: Supabase email/password; JWT on REST calls. Company from `GET /api/auth/verify-user`.

### Main journey
```text
Splash → Login → Home (Complaint Origin)
  → [most origins] Product | Equipment choice
      → Product: New Complaint wizard → Summary (PDF) → Home
      → Equipment: Facilities → Form → snackbar → back
  → [Retail] Product wizard directly
  → Bottom/side nav → Submitted Complaints list → detail modal
```

### Key API / write rules
- REST **GET only** for reads (verify-user, templates, products, facilities, departments, complaints)
- Complaint **create via Supabase insert** into `complaints` (not REST POST)
- Photos → Storage bucket `complaints`; staged shape `{ stage, path }`
- Do **not** send top-level `description` on create
- Retail skips Product/Equipment choice
- Submitted list client-filters `product_id != null`

Full field-level detail lives in the original mobile codebase / prior agent handoff. This web app implements parity with that behaviour.
