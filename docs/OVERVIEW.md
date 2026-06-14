# Kramp TCO Calculator — dokumentacja aplikacji

> Dokument referencyjny do przeniesienia/aktualizacji w Obsidian Vault
> (`3-Projects/Kramp/Kramp.md`). Stan na czerwiec 2026.

---

## 1. Czym jest

Mobile-first **kalkulator oszczędności konsolidacji** dla handlowców Kramp.
Handlowiec pokazuje go klientowi na telefonie podczas spotkania: wpisuje kilka
danych ze sklepu klienta i na żywo widać potencjalne oszczędności i odzyskany
czas z przejścia na zaopatrzenie u Kramp. Na końcu — formularz leadowy i
podsumowanie z raportem.

- **Live:** https://kramp-tco.vercel.app
- **Repo:** `github.com/tomekweber-eng/kramp-tco`
- **Charakter:** kontrakt (narzędzie demonstracyjne + lead generation).

---

## 2. Przepływ użytkownika

```
Hero  →  Moduł 1  →  Moduł 2  →  Moduł 3  →  Moduł 4  →  Formularz  →  Podsumowanie
(start)  spotkania   zamawianie   zapasy      transport   (RODO,gate)   (odblokowane)
```

- Nawigacja: przesuwanie w bok (swipe) + strzałki + kropki.
- **Sticky pasek wyników** widoczny od 1. modułu: „Potencjalne oszczędności /
  rok" + „Odzyskany czas / rok", aktualizowane na żywo + podpowiedź „Dalej: …".
- **Pasek postępu %** w nagłówku.
- Podsumowanie jest **zablokowane** do wypełnienia formularza (gate na leada).
- **Auto-save** (localStorage): odświeżenie strony wraca do ostatniego kroku.

---

## 3. Moduły i model obliczeń

Waluta: **PLN** (kwoty przeliczone z EUR po kursie **4,30**, zapisane na stałe).
Każdy moduł pokazuje minimalny zestaw pól obowiązkowych; reszta + scenariusz
„Z Kramp" jest pod **„Pokaż dane zaawansowane"** (wartości domyślne = benchmark
Kramp, więc wynik liczy się od razu).

| # | Moduł | Pole obowiązkowe | Co liczy |
|---|-------|------------------|----------|
| 1 | Spotkania z dostawcami | liczba dostawców, spotkania/rok | odzyskane godziny × stawka → dodatkowy przychód |
| 2 | Proces zamawiania | produkty/rok | krótszy czas wyszukania i przyjęcia → przychód |
| 3 | Amortyzacja zapasów | wartość zapasów | niższy odpis przy redukcji zapasów → oszczędność |
| 4 | Transport | **koszt jednej paczki** | roczny koszt = paczka × zamówienia; konsolidacja → oszczędność |

- **Wynik łączny:** `korzyść netto = przychód (M1+M2) + oszczędności (M3+M4)`.
- **Odzyskany czas:** suma godzin z M1 + M2.
- **Największy potencjał:** moduł o największym wkładzie (pokazany w
  podsumowaniu i w raporcie).
- Logika: [`src/lib/compute.ts`](../src/lib/compute.ts); domyślne wartości
  (`DEFAULTS`) = benchmark Kramp.

---

## 4. Funkcje

- **Polonizacja + Tone of Voice Kramp** (copy, mikrocopy „Dlaczego pytamy?" w
  każdym module, disclaimer „wyniki orientacyjne").
- **Pola obowiązkowe vs zaawansowane** — minimalny próg wejścia.
- **Sticky wynik** + podgląd wyniku przed formularzem („Już wyliczyliśmy…").
- **Walidacja w czasie rzeczywistym** (e-mail, kod pocztowy `00-000`).
- **RODO** — zgoda obowiązkowa (przetwarzanie) + opcjonalna (marketing).
- **Lead funnel** — zapis do bazy (zob. §6).
- **Raport** — „Pobierz raport PDF" (druk/zapis z przeglądarki) + CTA „Umów
  rozmowę z doradcą".
- **Mail z raportem (uśpiony)** — HTML + załącznik PDF; aktywacja przez klucz
  Resend (zob. `RESEND_SETUP.md`).

---

## 5. Architektura techniczna

- **Frontend:** Vite + React + TypeScript + Tailwind v4. Stan w `useState`,
  auto-save w `localStorage`. Build statyczny → `/dist`.
- **Backend:** Vercel Functions (`/api`):
  - `POST /api/lead` — walidacja → zapis leada do Neon → (opcjonalnie) mail.
- **Baza:** **Neon Postgres** (`@neondatabase/serverless`), darmowy tier.
  Tabela `leads` tworzona automatycznie przy 1. zapisie.
- **Mail (uśpiony):** **Resend** + **@react-pdf/renderer** (PDF z polskim
  fontem DejaVu). Odpala się tylko gdy ustawiony `RESEND_API_KEY`.
- **Hosting:** Vercel (projekt `kramp-tco` podlinkowany).

Kluczowe pliki: `src/App.tsx`, `src/lib/compute.ts`, `src/components/*`,
`api/lead.ts`, `api/report.ts`, `api/email.ts`.

---

## 6. Model danych — tabela `leads`

| Kolumna | Typ | Opis |
|---------|-----|------|
| `id` | bigserial | PK |
| `created_at` | timestamptz | data zapisu |
| `company` | text | nazwa firmy/sklepu |
| `email` | text | e-mail leada |
| `postal_code` | text | kod pocztowy |
| `inputs` | jsonb | dane wejściowe kalkulatora |
| `results` | jsonb | wyliczone wyniki |
| `net_benefit` | numeric | roczna korzyść netto (do szybkich raportów) |
| `consent_rodo` | bool | zgoda obowiązkowa |
| `consent_marketing` | bool | zgoda marketingowa |
| `ip`, `user_agent` | text | metadane techniczne |

Odczyt leadów: panel Neon → SQL Editor (`SELECT * FROM leads ORDER BY id DESC`).

---

## 7. Środowisko / zmienne

| Zmienna | Wymagana | Opis |
|---------|----------|------|
| `DATABASE_URL` | tak | Neon Postgres (ustawia integracja Vercel). |
| `RESEND_API_KEY` | nie | Klucz Resend. Brak = mail uśpiony. |
| `REPORT_FROM` | nie | Nadawca maila (domyślnie testowy adres Resend). |
| `REPORT_BCC` | nie | Kopia raportu do handlowca/CRM. |

Lokalnie: `cp .env.example .env` + `vercel dev` (uruchamia też `/api`).
Deploy: `vercel --prod` lub push na `main`.

---

## 8. Status (czerwiec 2026)

| Faza | Zakres | Status |
|------|--------|--------|
| 1 | PLN (kurs 4,30) + polonizacja/ToV | ✅ live |
| 2 | UX: sticky, progres %, pola zaawansowane, transport per-paczka, auto-save, walidacja | ✅ live |
| 3 | Lead funnel: `/api/lead` + Neon + RODO | ✅ live, przetestowane e2e |
| 4 | Mail raportu (HTML + PDF) | ✅ kod gotowy, **uśpiony** (czeka na klucz Resend) |
| 5 | CTA doradcy + dokumentacja | ✅ live |

---

## 9. Otwarte / do decyzji właściciela

1. **Aktywacja maila** — założyć Resend, ustawić `RESEND_API_KEY`,
   zweryfikować domenę nadawcy (do wysyłki klientom). Instrukcja:
   `RESEND_SETUP.md`.
2. **URL „Umów rozmowę z doradcą"** — w `SummarySlide.tsx` i `api/email.ts`
   tymczasowo linkuje do `kramp.com` (oznaczone `TODO`). Do podmiany na właściwy
   adres umawiania rozmowy.
3. **Kurs EUR→PLN 4,30** zapisany na stałe — przy większych wahaniach kursu do
   ręcznej aktualizacji w `DEFAULTS`.
4. **Benchmarki Kramp** (wartości domyślne scenariusza „Z Kramp") — do
   potwierdzenia/kalibracji z danymi Kramp.

---

## 10. Uwagi do brandu / treści

- Kolory CVI v1.0: Red `#af000f`, Dark blue `#121f32`, Turquoise `#65b994`,
  Success `#008259` (źródło: `src/index.css @theme`).
- Etykiety „Obecnie / Z Kramp" zamiast „Przed / Po Kramp" — świadomie, by nie
  brzmieć jak gwarantowana obietnica.
- Wszystkie kwoty w PLN; raport PDF i mail używają tych samych kolorów i fontu z
  polskimi znakami.
