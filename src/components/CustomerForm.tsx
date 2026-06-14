import { useState } from "react";
import {
  isEmailValid,
  isNameValid,
  isPostalValid,
  type Customer,
} from "../types";
import type { Results } from "../lib/compute";
import { hours, money } from "../lib/format";

export type Consent = { rodo: boolean; marketing: boolean };

type Props = {
  customer: Customer;
  results: Results;
  consent: Consent;
  onChange: (c: Customer) => void;
  onConsentChange: (c: Consent) => void;
  onSubmit: () => void;
  onForceShow: () => void;
  submitting: boolean;
  error: string | null;
  isValid: boolean;
};

export default function CustomerForm({
  customer,
  results,
  consent,
  onChange,
  onConsentChange,
  onSubmit,
  onForceShow,
  submitting,
  error,
  isValid,
}: Props) {
  const upd = (k: keyof Customer) => (v: string) =>
    onChange({ ...customer, [k]: v });

  return (
    <div className="h-full flex flex-col px-5 py-5 overflow-y-auto">
      {/* Locked badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex h-6 px-2 items-center rounded-full bg-kramp-red text-[11px] font-bold uppercase tracking-wider text-white gap-1">
          <Lock />
          Ostatni krok
        </span>
        <span className="text-[12px] text-kramp-blue/55 font-medium">
          Odblokuj podsumowanie
        </span>
      </div>

      <h1 className="font-display text-[24px] font-bold uppercase tracking-tight text-kramp-blue leading-[1.08] mb-1.5">
        Twój raport oszczędności
        <br />
        <span className="text-kramp-red">jest prawie gotowy.</span>
      </h1>
      <p className="text-[13px] leading-snug text-kramp-blue/65 mb-3">
        Uzupełnij dane, a otrzymasz pełny raport oszczędności wraz z
        rekomendacjami i wersją do druku.
      </p>

      {/* Already-computed preview — show the value before asking for data */}
      <div className="rounded-2xl bg-kramp-blue text-white px-3.5 py-3 mb-4 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1.5">
          Już wyliczyliśmy
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-wider font-bold opacity-70 leading-tight mb-0.5">
              Oszczędności / rok
            </div>
            <div className="font-display text-[20px] font-bold tabular-nums leading-none text-kramp-turquoise">
              {money(results.net_benefit)}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-wider font-bold opacity-70 leading-tight mb-0.5">
              Odzyskany czas / rok
            </div>
            <div className="font-display text-[20px] font-bold tabular-nums leading-none">
              {hours(results.total_hours_saved)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-2.5">
        <Input
          label="Nazwa firmy"
          value={customer.name}
          onChange={upd("name")}
          placeholder="np. Gospodarstwo Kowalski"
          autoComplete="organization"
          valid={isNameValid(customer.name)}
          error="Podaj nazwę firmy lub sklepu."
        />
        <Input
          label="E-mail"
          value={customer.email}
          onChange={upd("email")}
          placeholder="kontakt@sklep.pl"
          type="email"
          autoComplete="email"
          inputMode="email"
          valid={isEmailValid(customer.email)}
          error="Podaj poprawny adres e-mail."
        />
        <Input
          label="Kod pocztowy"
          value={customer.postalCode}
          onChange={upd("postalCode")}
          placeholder="00-000"
          autoComplete="postal-code"
          valid={isPostalValid(customer.postalCode)}
          error="Format: 00-000."
        />
      </div>

      {/* RODO consent */}
      <div className="grid gap-2 mt-3.5">
        <Check
          checked={consent.rodo}
          onChange={(v) => onConsentChange({ ...consent, rodo: v })}
        >
          Wyrażam zgodę na przetwarzanie moich danych osobowych przez Kramp w
          celu przygotowania i przesłania raportu oszczędności.{" "}
          <a
            href="#"
            className="underline text-kramp-blue/70"
            onClick={(e) => e.stopPropagation()}
          >
            Polityka prywatności
          </a>
          .
        </Check>
        <Check
          checked={consent.marketing}
          onChange={(v) => onConsentChange({ ...consent, marketing: v })}
        >
          Chcę otrzymywać informacje handlowe i oferty Kramp drogą elektroniczną
          <span className="text-kramp-blue/40"> (opcjonalnie)</span>.
        </Check>
      </div>

      <div className="mt-auto pt-4">
        {error && (
          <div className="mb-2.5 rounded-xl bg-kramp-red-tint border border-kramp-red/20 px-3 py-2">
            <p className="text-[12px] text-kramp-red font-medium leading-snug">
              {error}
            </p>
            <button
              type="button"
              onClick={onForceShow}
              className="mt-1 text-[11px] font-bold uppercase tracking-wider text-kramp-blue/70 underline"
            >
              Pokaż podsumowanie mimo to
            </button>
          </div>
        )}
        <button
          type="button"
          disabled={!isValid || submitting}
          onClick={onSubmit}
          className={[
            "w-full h-12 rounded-2xl font-display font-bold uppercase tracking-wide text-[15px] transition-all flex items-center justify-center gap-2",
            isValid && !submitting
              ? "bg-kramp-red text-white shadow-md hover:bg-kramp-red-dark active:scale-[0.99]"
              : "bg-kramp-blue/10 text-kramp-blue/40 cursor-not-allowed",
          ].join(" ")}
        >
          {submitting ? (
            "Zapisywanie…"
          ) : isValid ? (
            <>
              Odbierz pełny raport
              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                <path
                  d="M5 10h10m-4-4 4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          ) : (
            "Uzupełnij dane i zaznacz zgodę"
          )}
        </button>
        <p className="text-[10.5px] text-center text-kramp-blue/45 mt-2 leading-snug">
          Administratorem danych jest Kramp. Dane wykorzystamy wyłącznie do
          kontaktu w sprawie raportu.
        </p>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  valid,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "decimal";
  valid: boolean;
  error: string;
}) {
  const [touched, setTouched] = useState(false);
  const showError = touched && value.trim().length > 0 && !valid;

  return (
    <label className="block">
      <span className="block text-[10.5px] font-bold uppercase tracking-wider text-kramp-blue/60 mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={[
          "w-full h-11 rounded-xl bg-white border px-3.5 text-[15px] font-medium text-kramp-blue placeholder:text-kramp-blue/30 outline-none focus:ring-2",
          showError
            ? "border-kramp-red focus:border-kramp-red focus:ring-kramp-red/15"
            : "border-kramp-blue/15 focus:border-kramp-red focus:ring-kramp-red/15",
        ].join(" ")}
      />
      {showError && (
        <span className="block text-[10.5px] text-kramp-red font-medium mt-1">
          {error}
        </span>
      )}
    </label>
  );
}

function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer">
      <span
        className={[
          "flex-none mt-0.5 w-5 h-5 rounded-md border grid place-items-center transition-colors",
          checked
            ? "bg-kramp-red border-kramp-red"
            : "bg-white border-kramp-blue/25",
        ].join(" ")}
      >
        {checked && (
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-white" fill="none">
            <path
              d="M3 8.5l3 3 7-7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-[11px] leading-snug text-kramp-blue/65">
        {children}
      </span>
    </label>
  );
}

function Lock() {
  return (
    <svg viewBox="0 0 20 20" className="w-3 h-3" fill="none">
      <rect
        x="4.5"
        y="9"
        width="11"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 9V6.5a3 3 0 0 1 6 0V9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
