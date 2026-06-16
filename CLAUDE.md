# CLAUDE.md — Kramp TCO Calculator

Mobile-first kalkulator oszczędności konsolidacji dla handlowców Kramp
(pokaz na telefonie u klienta). Szczegóły techniczne/brand: zobacz `README.md` w tym folderze.

## Stack / odpalenie
Frontend: Vite + React + TypeScript + Tailwind v4 · `npm run dev` (:5173, też LAN) · `npm run build` (`tsc -b` + vite → `/dist`) · `npm run lint` (eslint).
Stan kalkulatora w `useState` + auto-save do `localStorage`.

Backend (lead funnel): **Vercel Functions** w `/api` + **Neon Postgres** (`@neondatabase/serverless`).
`POST /api/lead` zapisuje leada (tabela `leads` tworzona przy 1. zapisie) + zgody RODO.
Lokalnie z API: `vercel dev` (wymaga `DATABASE_URL` w `.env` — patrz `.env.example`).
Deploy: **Vercel** (`kramp-tco.vercel.app`), projekt podlinkowany.

Mailing (uśpiony): raport HTML + PDF (`@react-pdf/renderer`) przez **Resend** — wysyłka tylko gdy
ustawiony `RESEND_API_KEY`; bez klucza lead jest tylko zapisywany. Domena nadawcy do weryfikacji w Resend.

## Architektura — to, czego nie widać z jednego pliku
Pełna referencja: [`docs/OVERVIEW.md`](docs/OVERVIEW.md). Tu tylko pułapki przy edycji:

- **Slajdy to tablica w [`src/App.tsx`](src/App.tsx)** (hero · 4 moduły · formularz · [podsumowanie]).
  Podsumowanie jest *doklejane warunkowo* dopiero gdy `unlocked = submitted && customerOK` —
  zmiana indeksów slajdów rozjeżdża `STEP_TITLES`, `summaryIndex` i logikę pasków wyników.
- **Model liczenia: [`src/lib/compute.ts`](src/lib/compute.ts)**, czysta funkcja `compute(Inputs): Results`,
  liczona w `useMemo`. Moduły są **sprzężone**, nie niezależne:
  M2 skaluje liczbę zamówień i czasy współczynnikiem `a_suppliers/b_suppliers` z M1;
  M4 bierze liczby zamówień (`before/after_orders`) z M2. Zmiana M1 propaguje na M2 i M4.
  Każdy wynik przechodzi przez `safe()` (NaN/∞ → 0) — nie zakładaj, że pola są walidowane gdzie indziej.
- **`DEFAULTS` (compute.ts) = benchmark Kramp**, kwoty już w PLN (kurs 4,30 wpisany na stałe,
  komentarze pokazują źródłowe €). To wartości scenariusza „Z Kramp" — kalkulator liczy od razu, bez inputu.
- **Kontrakt leada:** front POST-uje `{company,email,postalCode,consentRodo,consentMarketing,inputs,results}`
  do `/api/lead`; `results` to cały obiekt z `compute`. Demo nie może się zaciąć na błędzie sieci —
  formularz ma fallback „pokaż mimo to" (`onForceShow`/`unlock`), który odblokowuje bez zapisu.
- **`api/lead.ts` szuka connection stringa pod kilkoma nazwami** (`DATABASE_URL` → `POSTGRES_URL` → …);
  tabela `leads` tworzona `CREATE TABLE IF NOT EXISTS` przy 1. zapisie. Mail to best-effort try/catch
  (błąd maila nigdy nie psuje zapisu leada). PDF importowany dynamicznie, by nie obciążać cold-startu.
- **Raport PDF: [`api/report.ts`](api/report.ts)** = 3-stronicowy raport (str.1 streszczenie · str.2 cztery dźwignie
  „Co liczymy → Skąd → Ile → Dlaczego" z słupkami przed/po · str.3 założenia + metodyka + CTA). Renderuje z **pełnych
  `inputs` + `results`** (oba muszą dotrzeć z `/api/lead`). Fixed header (logo z [`api/logo.ts`](api/logo.ts) jako
  base64 + claim „To takie proste.") i stopka z danymi kontaktowymi powtarzają się na każdej stronie. Copy pisane
  pod **brandbook Kramp** (2. osoba, zwięźle, partnersko, bez nachalnej sprzedaży). Trzymanie się 3 stron zależy od
  zwartości bloków — zmiana copy/odstępów może przerzucić treść na 4. stronę (sprawdź renderem).
- **TODO do podmiany** (oznaczone w kodzie): URL „Umów rozmowę z doradcą" w `SummarySlide.tsx` i `api/email.ts`
  tymczasowo linkuje do `kramp.com`; dane kontaktowe Kramp w stopce PDF (`CONTACT` w `api/report.ts`) to publiczne
  dane ze strony — **zweryfikować przed wysyłką na żywo**.

## Strategia / status / historia — NIE tutaj
Kontekst klienta, decyzje, brandbook, "co zrobione kiedy" → Obsidian Vault:
  `/Users/veba/Documents/Obsidian Vault/3-Projects/Kramp/Kramp.md`
Reguły pracy + routing → `../../CLAUDE.md` (router) + Vault `CLAUDE.md` §4
