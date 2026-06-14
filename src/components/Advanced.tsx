import { useState, type ReactNode } from "react";

/**
 * Collapsible "Pokaż dane zaawansowane" disclosure. Keeps the calculator to a
 * minimal set of required fields by default; power users can reveal optional
 * inputs and the Kramp benchmark scenario.
 */
export default function Advanced({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wider text-kramp-blue/55 hover:text-kramp-blue/80 transition-colors"
      >
        {open ? "Ukryj dane zaawansowane" : "Pokaż dane zaawansowane"}
        <svg
          viewBox="0 0 16 16"
          className={[
            "w-3.5 h-3.5 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          fill="none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <div className="grid gap-2.5">{children}</div>}
    </div>
  );
}
