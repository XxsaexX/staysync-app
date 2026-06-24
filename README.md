# StaySync — web app (public deployment)

**▶ Live:** https://xxsaexx.github.io/staysync-app/

Public hosting of the StaySync reservation tool (a single-page app), served via GitHub Pages.

This repository contains **only the client build** — three files, no secrets:

- `index.html` — the app (the same code every visitor's browser downloads)
- `config.js` — publishable keys only (Supabase publishable key + EmailJS public IDs)
- `tg-templates.js` — notification message strings

All authentication and data access are enforced **server-side**: Supabase Row-Level Security plus an Edge Function hold the real boundary. No private keys, tokens, or guest data live here.

> Generated mirror of the private source repo's curated deploy folder. Do not edit here.
