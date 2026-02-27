# Five Space World

Architecture at civilisational scale — civic, cultural, institutional.

**Live site:** https://fivespace.zahan.one  
**Sister brand:** [Safa Zahan](https://safa.zahan.one) — boutique interiors & residences  
**Shared database:** Same Supabase project as Safa Zahan (`brand = 'fivespace'` filters all queries)

---

## Stack

- **Frontend:** Vanilla HTML/CSS/JS — no framework
- **Database:** Supabase (shared with Safa Zahan, brand-isolated via RLS)
- **Image storage:** Supabase Storage — `project-images` bucket
- **Email:** Resend via `/api/contact` serverless function
- **Hosting:** Vercel
- **Domain:** fivespace.zahan.one

---

## File Structure

```
/
├── index.html          # Homepage
├── projects.html       # All projects archive
├── project.html        # Single project detail
├── 404.html            # Not found page
├── env.example.js      # Credential template (copy to env.js locally)
├── vercel.json         # Vercel config + build command
├── robots.txt
├── css/
│   └── main.css        # Complete design system (sky gradient (Cerulean → Blueprint) + grey sandstone palette)
├── js/
│   ├── config.js       # Supabase client + all data helpers
│   ├── components.js   # Nav + footer injection
│   └── projects.js     # Projects page logic
├── admin/
│   ├── index.html      # CMS login + panel
│   ├── admin.js        # Admin logic
│   └── sitemap.html    # Sitemap generator
└── api/
    └── contact.js      # Resend email serverless function
```

---

## Environment Variables (Vercel)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | From Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | From Supabase → Settings → API |
| `RESEND_API_KEY` | From Resend dashboard |

Build command (already in vercel.json):
```
echo "window.ENV={SUPABASE_URL:'$SUPABASE_URL',SUPABASE_ANON_KEY:'$SUPABASE_ANON_KEY'};" > env.js
```

---

## Admin

Visit `/admin` → log in with Supabase email/password credentials.

- Add / edit / delete projects
- Upload images directly to Supabase Storage
- View contact form submissions
- Generate sitemap at `/admin/sitemap.html`

---

## Supabase Schema

Shared with Safa Zahan — see `supabase-setup.sql` in the Safa Zahan repo.  
All queries filter by `brand = 'fivespace'` automatically via `SITE_CONFIG.brand`.
