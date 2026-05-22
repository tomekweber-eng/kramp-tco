import type { Customer } from "../types";

type Props = {
  customer: Customer;
  onChange: (c: Customer) => void;
  onSubmit: () => void;
  isValid: boolean;
};

export default function CustomerForm({
  customer,
  onChange,
  onSubmit,
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
          Final step
        </span>
        <span className="text-[12px] text-kramp-blue/55 font-medium">
          Unlock the summary
        </span>
      </div>

      <h1 className="font-display text-[26px] font-bold uppercase tracking-tight text-kramp-blue leading-[1.05] mb-1.5">
        Almost there.
        <br />
        <span className="text-kramp-red">Where shall we send it?</span>
      </h1>
      <p className="text-[13px] leading-snug text-kramp-blue/65 mb-4">
        Enter your details and we'll show you the full TCO report — with charts,
        per-module impact and a printable one-pager.
      </p>

      <div className="grid gap-2.5">
        <Input
          label="Customer / shop name"
          value={customer.name}
          onChange={upd("name")}
          placeholder="e.g. Smith Farm Equipment"
          autoComplete="organization"
        />
        <Input
          label="Email"
          value={customer.email}
          onChange={upd("email")}
          placeholder="contact@shop.com"
          type="email"
          autoComplete="email"
          inputMode="email"
        />
        <Input
          label="Postal code"
          value={customer.postalCode}
          onChange={upd("postalCode")}
          placeholder="00-000"
          autoComplete="postal-code"
        />
      </div>

      <div className="mt-auto pt-4">
        <button
          type="button"
          disabled={!isValid}
          onClick={onSubmit}
          className={[
            "w-full h-12 rounded-2xl font-display font-bold uppercase tracking-wide text-[15px] transition-all flex items-center justify-center gap-2",
            isValid
              ? "bg-kramp-red text-white shadow-md hover:bg-kramp-red-dark active:scale-[0.99]"
              : "bg-kramp-blue/10 text-kramp-blue/40 cursor-not-allowed",
          ].join(" ")}
        >
          {isValid ? (
            <>
              Show my savings
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
            "Fill in all fields"
          )}
        </button>
        <p className="text-[10.5px] text-center text-kramp-blue/45 mt-2 leading-snug">
          We never share your data. This is a sales demo tool.
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "decimal";
}) {
  return (
    <label className="block">
      <span className="block text-[10.5px] font-bold uppercase tracking-wider text-kramp-blue/60 mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="w-full h-11 rounded-xl bg-white border border-kramp-blue/15 px-3.5 text-[15px] font-medium text-kramp-blue placeholder:text-kramp-blue/30 outline-none focus:border-kramp-red focus:ring-2 focus:ring-kramp-red/15"
      />
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
