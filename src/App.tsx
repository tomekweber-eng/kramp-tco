import { useMemo, useRef, useState } from "react";
import { compute, DEFAULTS, type Inputs } from "./lib/compute";
import { money } from "./lib/format";
import BeforeCard from "./components/BeforeCard";
import Field from "./components/Field";
import { Pager, PagerNav, type PagerHandle } from "./components/Pager";
import HeroSlide from "./components/HeroSlide";
import CustomerForm from "./components/CustomerForm";
import SummarySlide from "./components/SummarySlide";
import { isCustomerValid, type Customer } from "./types";

// Zamówienia liczymy rocznie: tygodniowo × liczba tygodni roboczych w roku.
const WEEKS_PER_YEAR = 47;

export default function App() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    email: "",
    postalCode: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [active, setActive] = useState(0);
  const pagerRef = useRef<PagerHandle>(null);

  const r = useMemo(() => compute(inputs), [inputs]);
  const customerOK = isCustomerValid(customer);
  const unlocked = submitted && customerOK;

  const set =
    <K extends keyof Inputs>(k: K) =>
    (v: number) =>
      setInputs((i) => ({ ...i, [k]: v }));

  const reset = () => {
    if (window.confirm("Zresetować wszystkie dane i zacząć od nowa?")) {
      setInputs(DEFAULTS);
      setCustomer({ name: "", email: "", postalCode: "" });
      setSubmitted(false);
      pagerRef.current?.goTo(0);
    }
  };

  // Slide layout:
  //   0   hero / welcome
  //   1   wszystkie dane wejściowe (jeden ekran)
  //   2   customer form (gate)
  //   3   summary (only after submit)
  const slides = [
    <HeroSlide key="hero" onStart={() => pagerRef.current?.next()} />,

    <div
      key="inputs"
      className="h-full flex flex-col px-4 pt-4 pb-3 overflow-y-auto"
    >
      <div className="flex-none mb-3">
        <h2 className="font-display text-[20px] font-bold uppercase tracking-tight text-kramp-blue leading-tight">
          Twoje dane
        </h2>
        <p className="text-[12px] text-kramp-blue/55 leading-snug mt-0.5">
          Cztery liczby — resztę policzymy za Ciebie.
        </p>
      </div>
      <BeforeCard>
        <Field
          label="Liczba dostawców"
          value={inputs.b_suppliers}
          onChange={set("b_suppliers")}
          min={1}
          hint="Zakładamy jedno spotkanie z każdym dostawcą rocznie (po 1 godz.)."
        />
        <Field
          label="Zamówienia / tydzień"
          value={Math.round(inputs.orders_per_year / WEEKS_PER_YEAR)}
          onChange={(v) => set("orders_per_year")(v * WEEKS_PER_YEAR)}
          min={0}
          hint={`Liczymy rocznie: tygodniowo × ${WEEKS_PER_YEAR} tygodni. Zakładamy 3 min na znalezienie produktu i 5 min na przyniesienie z półki.`}
        />
        <Field
          label="Średnia wartość zapasów"
          value={inputs.b_stock_value}
          onChange={set("b_stock_value")}
          unit="€"
          step={1000}
          min={0}
          hint="% do odpisu i poziom odpisu uzupełniamy wartościami domyślnymi."
        />
        <Field
          label="Koszt transportu / rok"
          value={inputs.b_transport_cost}
          onChange={set("b_transport_cost")}
          unit="€"
          step={500}
          min={0}
          hint="Porównujemy z kosztem, gdyby wszystkie zamówienia szły przez Kramp."
        />
      </BeforeCard>
    </div>,

    <CustomerForm
      key="customer"
      customer={customer}
      onChange={setCustomer}
      onSubmit={() => {
        setSubmitted(true);
        // Defer to allow the new summary slide to render before scrolling.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => pagerRef.current?.next()),
        );
      }}
      isValid={customerOK}
    />,
  ];

  if (unlocked) {
    slides.push(
      <SummarySlide key="summary" results={r} customer={customer} />,
    );
  }

  const summaryIndex = unlocked ? slides.length - 1 : -1;
  const onHero = active === 0;

  return (
    <div className="h-dvh flex flex-col bg-zinc-100 overflow-hidden">
      <div className="mx-auto w-full max-w-[460px] h-full flex flex-col bg-zinc-50 sm:my-3 sm:rounded-3xl sm:overflow-hidden sm:shadow-xl sm:h-[calc(100dvh-1.5rem)]">
        {!onHero && (
          <TopBar
            onReset={reset}
            step={active + 1}
            total={slides.length}
          />
        )}

        <Pager ref={pagerRef} onIndexChange={setActive} children={slides} />

        <nav className="no-print flex-none border-t border-kramp-blue/10 bg-white">
          <PagerNav
            count={slides.length}
            active={active}
            onJump={(i) => pagerRef.current?.goTo(i)}
            onPrev={() => pagerRef.current?.prev()}
            onNext={() => pagerRef.current?.next()}
            highlight={summaryIndex}
          />

          {unlocked && active !== summaryIndex && (
            <button
              type="button"
              onClick={() => pagerRef.current?.goTo(summaryIndex)}
              className="w-full bg-kramp-red text-white px-4 py-2 active:bg-kramp-red-dark transition-colors"
              style={{
                paddingBottom:
                  "calc(env(safe-area-inset-bottom, 0px) + 8px)",
              }}
            >
              <div className="grid grid-cols-3 gap-1 text-left">
                <Cell label="Przychód / rok" value={money(r.total_revenue)} />
                <Cell
                  label="Oszczędności / rok"
                  value={money(r.total_savings)}
                />
                <Cell
                  label="Netto / rok"
                  value={money(r.net_benefit)}
                  highlight
                />
              </div>
              <div className="text-center text-[9.5px] uppercase tracking-[0.18em] font-bold opacity-85 mt-1">
                Dotknij, aby zobaczyć pełne podsumowanie →
              </div>
            </button>
          )}

          {!unlocked && active !== 0 && (
            <div
              className="px-4 pt-1 pb-2 text-center text-[10.5px] text-kramp-blue/50 leading-snug"
              style={{
                paddingBottom:
                  "calc(env(safe-area-inset-bottom, 0px) + 6px)",
              }}
            >
              {active === 1
                ? "Przewiń dalej, aby przejść do podsumowania."
                : "Uzupełnij dane, aby odblokować podsumowanie."}
            </div>
          )}

          {!unlocked && active === 0 && (
            <div
              style={{
                paddingBottom:
                  "calc(env(safe-area-inset-bottom, 0px) + 4px)",
              }}
            />
          )}
        </nav>
      </div>
    </div>
  );
}

function TopBar({
  onReset,
  step,
  total,
}: {
  onReset: () => void;
  step: number;
  total: number;
}) {
  return (
    <header
      className="no-print flex-none bg-kramp-red text-white shadow-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="px-3 py-2 flex items-center gap-2.5">
        <KrampMark />
        <div className="min-w-0 flex-1 leading-none">
          <div className="font-display text-[15px] font-bold uppercase tracking-tight">
            Kalkulator TCO
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-semibold opacity-80 mt-0.5 truncate">
            To takie proste.
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-wider font-bold opacity-85 tabular-nums whitespace-nowrap">
          {step}/{total}
        </div>
        <button
          type="button"
          onClick={onReset}
          aria-label="Przywróć domyślne"
          className="flex-none w-8 h-8 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-[16px] h-[16px]" fill="none">
            <path
              d="M4 4v6h6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 12a8 8 0 1 1-2.34-5.66L20 9"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

function KrampMark() {
  return (
    <div className="flex-none w-9 h-6 grid place-items-center bg-white/10 rounded">
      <svg viewBox="0 0 56 36" className="w-7 h-4" aria-label="Kramp">
        <rect x="2" y="4" width="40" height="4" fill="#fff" />
        <rect x="2" y="14" width="32" height="4" fill="#fff" />
        <rect x="2" y="24" width="40" height="4" fill="#fff" />
        <polygon points="36,4 48,16 36,28 30,28 42,16 30,4" fill="#fff" />
      </svg>
    </div>
  );
}


function Cell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0 px-1">
      <div className="text-[8.5px] uppercase tracking-wider font-bold opacity-75 leading-tight mb-0.5 truncate">
        {label}
      </div>
      <div
        className={[
          "font-display font-bold tabular-nums leading-none truncate",
          highlight ? "text-[16px]" : "text-[13px] opacity-95",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
