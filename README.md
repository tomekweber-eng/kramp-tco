# Kramp TCO Calculator

Mobile-first web app for Kramp salespeople — show consolidation savings live, on a phone, at a customer meeting.

## Run

```bash
npm install
npm run dev          # Vite at http://localhost:5173 — also on the LAN URL it prints (open on your phone)
vercel dev           # like `dev`, but also runs the /api functions locally (needs DATABASE_URL in .env)
npm run build        # produces /dist
```

The frontend (`/dist`) is a static bundle. The lead funnel adds Vercel serverless functions under `/api`, so deploy to **Vercel** (already linked: `kramp-tco.vercel.app`). On iOS, "Add to Home Screen" makes it feel native (PWA meta tags are wired up in `index.html`).

## Stack

- **Frontend:** Vite + React + TypeScript + Tailwind v4. Calculator state is local `useState`, auto-saved to `localStorage` (refresh resumes where you left off).
- **Backend:** Vercel Functions (`/api/lead`) storing leads in **Neon Postgres** (`@neondatabase/serverless`). The `leads` table is created on first write.
- **Mailing (dormant):** report e-mail (HTML + PDF via `@react-pdf/renderer`) through **Resend** — only fires when `RESEND_API_KEY` is set; otherwise the lead is just stored. See `.env.example`.

### Environment

Copy `.env.example` → `.env` for local `vercel dev`. On Vercel the Neon integration provides `DATABASE_URL`; add `RESEND_API_KEY` (+ optional `REPORT_FROM`, `REPORT_BCC`) to activate e-mail.

## Brand

Colours, typography and tone follow the Kramp Brandbook v1.0 (Red `#af000f`, Dark blue `#121f32`, Turquoise `#65b994`; Barlow Condensed Bold for titles, Barlow for body).
