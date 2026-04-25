# Five Space World

Architecture at civilisational scale — knowledge, community, learning, productive and residential spaces.

**Live site:** https://fivespace.zahan.one  
**Sister brand:** [Safa Zahan](https://safa.zahan.one) — hospitality, luxury residences & bespoke interiors  
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
│   └── main.css        # Complete design system (sky gradient + grey sandstone palette, full font system)
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

## Design System

### Font System

Two typefaces form the typographic identity of Five Space World. Both are loaded via Google Fonts and consumed exclusively through CSS custom properties — **never hardcode a font family directly**.

#### Typefaces

| Role | Family | Fallback | CSS Variable |
|---|---|---|---|
| **Display** | Playfair Display | Georgia, serif | `--font-display` |
| **Body / UI** | DM Sans | system-ui, sans-serif | `--font-body` |

#### Google Fonts `<link>`

All three HTML files (`index.html`, `projects.html`, `project.html`) load the same font URL:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap" rel="stylesheet" />
```

#### Weight usage

**Playfair Display** (`--font-display`) — headings, hero title, section titles, project titles, nav logo, card names, stat numbers, footer brand.

| Weight | Usage |
|---|---|
| 400 | Section headings, project titles |
| 500 | Nav logo, display labels |
| 600 | Sub-headings, card names |
| 700 | Hero title (largest displays) |
| *Italic 400–600* | Hero indent line, decorative quotes |

**DM Sans** (`--font-body`) — body copy, UI labels, nav links, buttons, metadata, section labels, form fields.

| Weight | Usage |
|---|---|
| 300 | Light metadata, captions |
| 400 | Body paragraphs |
| 500 | Emphasised body, section labels |
| 600 | Nav links, button text, filter labels |

#### CSS Variables (defined in `css/main.css → :root`)

```css
--font-display: 'Playfair Display', Georgia, serif;
--font-body:    'DM Sans', system-ui, sans-serif;
```

---

### Colour Palette

Defined as CSS custom properties in `css/main.css → :root`. Dark mode overrides are in `[data-theme="dark"]`.

#### Sky — structural gradient (Cerulean → Blueprint)

| Token | Value | Usage |
|---|---|---|
| `--sky` | `#2A7FBA` | Cerulean — gradient start, accents |
| `--sky-end` | `#1A5276` | Blueprint — gradient end |
| `--sky-lt` | `#5AAAD4` | Hover text on dark backgrounds |
| `--sky-dk` | `#0E3248` | Darkest sky — primary headings |
| `--sky-mist` | `#C8E8F8` | Light sky — text on dark backgrounds |

#### Concrete / Grey Sandstone — interactive elements

| Token | Value | Usage |
|---|---|---|
| `--concrete` | `#9A9088` | Buttons, active states |
| `--concrete-lt` | `#C4BCB4` | Borders, dividers |
| `--concrete-dk` | `#6A6058` | Body text, hover |
| `--concrete-pale` | `#E8E4E0` | Backgrounds, cards |

#### Neutrals

| Token | Value | Usage |
|---|---|---|
| `--cream` | `#E8E4E0` | Warm grey sandstone — page background |
| `--cream-dk` | `#DDD9D4` | Slightly darker sandstone |
| `--earth` | `#3A3630` | Near-black body text |
| `--earth-dk` | `#1C1A18` | Deepest dark |

#### Pre-built Gradients

```css
--grad-nav:      linear-gradient(90deg, #1A5276 0%, #2A7FBA 50%, #1A6A90 100%);
--grad-footer:   linear-gradient(90deg, #1A5276 0%, #2A7FBA 100%);
--grad-stats:    linear-gradient(90deg, #2A7FBA 0%, #1A5276 100%);
--grad-section:  linear-gradient(160deg, #2A7FBA 0%, #0E3248 100%);
```

---

### Space Categories

Five Space World designs across five space types. These drive project categorisation in the database, filter buttons in `projects.html`, and the contact form dropdown in `index.html`.

| # | Category | Types |
|---|---|---|
| 01 | **Knowledge Spaces** | Museums, Libraries, Cultural Centres, Archives |
| 02 | **Community Spaces** | Civic Halls, Public Buildings, Places of Worship, Community Centres |
| 03 | **Learning Spaces** | Schools, Universities, Campuses, Research Institutes |
| 04 | **Productive Spaces** | Corporate Offices, Retail Architecture, Mixed-Use Buildings, Studio Buildings, Market Halls |
| 05 | **Residential Spaces** | Private Villas, Housing Developments, Apartment Buildings, Bespoke Interiors, Landscape & Grounds |

> **Note:** Productive Spaces is the merger of the former "Work Spaces" and "Commerce Spaces" categories. Residential Spaces replaces the former "Residential Interiors" and now covers both interior and exterior residential architecture.

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
