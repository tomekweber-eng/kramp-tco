# Aktywacja maila z raportem (Resend)

Kod wysyłki maila jest **gotowy, ale uśpiony**. Dopóki nie ustawisz
`RESEND_API_KEY`, `POST /api/lead` tylko zapisuje leada do bazy Neon i **nie
wysyła** żadnego maila (bez błędu). Po dodaniu klucza — przy każdym zapisie
leada klient dostaje maila z raportem (HTML + załącznik PDF).

Czas: ~5 minut bez własnej domeny (tylko testy na swój adres),
~15–30 minut z weryfikacją domeny (wysyłka do klientów).

---

## Krok 1 — Konto i klucz API Resend

**Opcja A (zalecana) — przez Vercel:**
1. https://vercel.com/tomekweber-3357s-projects/kramp-tco → **Storage** /
   **Integrations** → znajdź **Resend** → **Add Integration / Connect**.
2. Połącz z projektem `kramp-tco`. Integracja sama ustawi `RESEND_API_KEY`
   w zmiennych środowiskowych projektu (Production/Preview/Development).

**Opcja B — ręcznie:**
1. Załóż konto na https://resend.com (darmowy plan: 100 maili/dzień, 3000/mies.).
2. **API Keys** → **Create API Key** (uprawnienie *Sending access*) → skopiuj
   klucz (`re_...`).
3. W Vercel: projekt → **Settings → Environment Variables** → dodaj
   `RESEND_API_KEY = re_...` dla **Production** (i Preview, jeśli chcesz testować).

---

## Krok 2 — Adres nadawcy (`REPORT_FROM`)

### Szybki test (bez domeny)
Zostaw domyślny adres testowy Resend — nic nie ustawiasz. **Ograniczenie:**
możesz wysyłać **tylko na adres e-mail właściciela konta Resend**. Idealne do
sprawdzenia, jak wygląda mail i PDF.

### Wysyłka do klientów (wymaga domeny)
1. Resend → **Domains** → **Add Domain** → wpisz swoją domenę (np.
   `twojadomena.pl`).
2. Dodaj u operatora DNS rekordy, które pokaże Resend (SPF + DKIM, zwykle
   3–4 wpisy TXT/CNAME). Poczekaj na status **Verified** (od kilku minut do kilku
   godzin).
3. W Vercel ustaw zmienną:
   ```
   REPORT_FROM = Kramp <raport@twojadomena.pl>
   ```
   (adres musi być na zweryfikowanej domenie).

---

## Krok 3 — Kopia dla handlowca / CRM (opcjonalnie)

Aby każdy raport trafiał też do Ciebie/CRM, ustaw w Vercel:
```
REPORT_BCC = handlowiec@twojadomena.pl
```

---

## Krok 4 — Redeploy

Zmienne środowiskowe działają od **nowego** deploymentu:
```bash
vercel --prod
```
(albo push na `main`, jeśli masz podpięty auto-deploy z GitHuba).

---

## Krok 5 — Test

1. Wejdź na https://kramp-tco.vercel.app, przejdź kalkulator do końca.
2. W formularzu podaj **swój** adres (jeśli bez domeny — adres konta Resend),
   zaznacz zgodę RODO, wyślij.
3. Sprawdź skrzynkę: mail „Twój raport oszczędności Kramp" + PDF w załączniku.
4. Podgląd dostarczalności: panel Resend → **Emails** (status, otwarcia, błędy).

---

## Zmienne środowiskowe — ściąga

| Zmienna          | Wymagana | Opis |
|------------------|----------|------|
| `RESEND_API_KEY` | tak (do maila) | Klucz API Resend. Brak = mail uśpiony. |
| `REPORT_FROM`    | nie      | Nadawca. Domyślnie `Kramp <onboarding@resend.dev>` (tylko testy na swój adres). Do klientów: adres na zweryfikowanej domenie. |
| `REPORT_BCC`     | nie      | Adres kopii każdego raportu (handlowiec/CRM). |

Wszystkie też w `.env.example` (do lokalnego `vercel dev`).

---

## Rozwiązywanie problemów

- **Lead zapisany, mail nie przyszedł** — sprawdź, czy `RESEND_API_KEY` jest w
  env *Production* i czy zrobiłeś redeploy. Logi: Vercel → Deployments →
  Functions → `api/lead` (szukaj „report email failed").
- **`You can only send testing emails to your own email`** — używasz adresu
  testowego bez domeny. Zweryfikuj domenę i ustaw `REPORT_FROM` (Krok 2).
- **Mail bez PDF / błąd renderu** — PDF używa fontu DejaVu pobieranego z CDN;
  jednorazowy błąd sieci może go pominąć. Lead i tak jest zapisany (wysyłka jest
  best-effort i nie blokuje zapisu).
- **Trafia do spamu** — dokończ weryfikację SPF/DKIM domeny w Resend.

> Uwaga projektowa: wysyłka jest *best-effort* — błąd maila **nigdy** nie
> przerywa zapisu leada. Zapis do bazy jest źródłem prawdy, mail to dodatek.
