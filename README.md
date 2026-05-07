# Kramp TCO Calculator

Mobile-first web app for Kramp salespeople — show consolidation savings live, on a phone, at a customer meeting.

## Run

```bash
npm install
npm run dev          # opens at http://localhost:5173 — also reachable on the LAN URL it prints (open on your phone)
npm run build        # produces /dist
```

`/dist` is a static bundle — drag-and-drop to Vercel or Netlify and you have a public URL. On iOS, "Add to Home Screen" makes it feel native (PWA meta tags are already wired up in `index.html`).

## Stack

Vite + React + TypeScript + Tailwind v4. State is local `useState` only, no backend, no persistence.

## Brand

Colours, typography and tone follow the Kramp Brandbook v1.0 (Red `#af000f`, Dark blue `#121f32`, Turquoise `#65b994`; Barlow Condensed Bold for titles, Barlow for body).
