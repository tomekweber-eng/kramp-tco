# CLAUDE.md — Kramp TCO Calculator

Mobile-first kalkulator oszczędności konsolidacji dla handlowców Kramp
(pokaz na telefonie u klienta). Szczegóły techniczne/brand: zobacz `README.md` w tym folderze.

## Stack / odpalenie
Frontend: Vite + React + TypeScript + Tailwind v4 · `npm run dev` (:5173, też LAN) · `npm run build` → `/dist`.
Stan kalkulatora w `useState` + auto-save do `localStorage`.

Backend (lead funnel): **Vercel Functions** w `/api` + **Neon Postgres** (`@neondatabase/serverless`).
`POST /api/lead` zapisuje leada (tabela `leads` tworzona przy 1. zapisie) + zgody RODO.
Lokalnie z API: `vercel dev` (wymaga `DATABASE_URL` w `.env` — patrz `.env.example`).
Deploy: **Vercel** (`kramp-tco.vercel.app`), projekt podlinkowany.

Mailing (uśpiony): raport HTML + PDF (`@react-pdf/renderer`) przez **Resend** — wysyłka tylko gdy
ustawiony `RESEND_API_KEY`; bez klucza lead jest tylko zapisywany. Domena nadawcy do weryfikacji w Resend.

## Strategia / status / historia — NIE tutaj
Kontekst klienta, decyzje, brandbook, "co zrobione kiedy" → Obsidian Vault:
  `/Users/veba/Documents/Obsidian Vault/3-Projects/Kramp/Kramp.md`
Reguły pracy + routing → `../../CLAUDE.md` (router) + Vault `CLAUDE.md` §4
