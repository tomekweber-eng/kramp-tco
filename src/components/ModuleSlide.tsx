import { useState, type ReactNode } from "react";
import { hours, money } from "../lib/format";

type Props = {
  index: number;
  title: string;
  subtitle: string;
  why?: string;
  /** Minimal required inputs — first tab. */
  basic: ReactNode;
  /** Optional assumptions / Kramp scenario — second tab. */
  advanced?: ReactNode;
  basicLabel?: string;
  advancedLabel?: string;
  /** Reinforcement bullets ("Dlaczego to ważne") shown above the result. */
  whyImportant?: string[];
  hoursSaved?: number;
  impact: number;
  impactLabel: string;
  /** True when this slide is the one on screen. */
  isActive?: boolean;
};

export default function ModuleSlide({
  index,
  title,
  subtitle,
  why,
  basic,
  advanced,
  basicLabel = "Twoje dane",
  advancedLabel = "Zmień założenia kalkulacji",
  whyImportant,
  hoursSaved,
  impact,
  impactLabel,
  isActive,
}: Props) {
  const [tab, setTab] = useState<"basic" | "advanced">("basic");
  const hasTabs = !!advanced;

  // Arriving at a step always lands on "Twoje dane", even if this module was
  // last left on the assumptions tab. Reset on the inactive→active transition
  // during render (React's documented "adjust state on prop change" pattern).
  const [wasActive, setWasActive] = useState(!!isActive);
  if (!!isActive !== wasActive) {
    setWasActive(!!isActive);
    if (isActive) setTab("basic");
  }

  return (
    <div className="h-full flex flex-col px-4 pt-3 pb-2 overflow-hidden">
      {/* Title row */}
      <div className="flex items-center gap-2.5 mb-2 flex-none">
        <span className="flex-none w-8 h-8 rounded-lg bg-kramp-red text-white grid place-items-center font-display text-[15px] font-bold">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[16px] leading-tight font-bold uppercase tracking-tight text-kramp-blue truncate">
            {title}
          </div>
          <div className="text-[11px] text-kramp-blue/55 leading-tight truncate">
            {subtitle}
          </div>
        </div>
      </div>

      {/* "Why we ask" microcopy */}
      {why && (
        <p className="flex-none mb-2 text-[11px] leading-snug text-kramp-blue/55">
          <span className="font-bold text-kramp-blue/70">Dlaczego pytamy? </span>
          {why}
        </p>
      )}

      {/* Tabs: basic inputs vs. calculation assumptions */}
      {hasTabs && (
        <div className="flex-none mb-2 grid grid-cols-2 gap-1 p-1 rounded-xl bg-kramp-blue/[0.06]">
          <TabButton active={tab === "basic"} onClick={() => setTab("basic")}>
            {basicLabel}
          </TabButton>
          <TabButton
            active={tab === "advanced"}
            onClick={() => setTab("advanced")}
          >
            {advancedLabel}
          </TabButton>
        </div>
      )}

      {/* Inputs area — scrolls vertically only if content really overflows.
          touch-action: pan-y keeps vertical scroll from being stolen by the
          horizontal swipe pager on touch devices. */}
      <div
        className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1 grid gap-2 content-start"
        style={{ touchAction: "pan-y" }}
      >
        {hasTabs ? (tab === "basic" ? basic : advanced) : basic}
      </div>

      {/* "Why it matters" reinforcement bullets — basic tab only, to keep the
          assumptions tab compact enough to fit one screen. */}
      {(!hasTabs || tab === "basic") && whyImportant && whyImportant.length > 0 && (
        <div className="flex-none mt-2 rounded-2xl bg-kramp-turquoise-tint border border-kramp-turquoise/30 px-3.5 py-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-kramp-success mb-1">
            Dlaczego to ważne
          </div>
          <ul className="grid gap-1">
            {whyImportant.map((t) => (
              <li
                key={t}
                className="flex items-start gap-2 text-[11.5px] leading-snug text-kramp-blue/80"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="w-3.5 h-3.5 mt-0.5 flex-none text-kramp-turquoise"
                  fill="none"
                >
                  <path
                    d="M3 8.5l3 3 7-7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Result strip — basic tab only; on the assumptions tab the global bar
          already shows totals, freeing the full height for the fields. */}
      {(!hasTabs || tab === "basic") && (
        <div className="mt-2.5 flex-none rounded-2xl bg-white border-2 border-kramp-blue px-3.5 py-2.5 flex items-center gap-3">
        {hoursSaved !== undefined && (
          <>
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <ClockIcon />
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-wider text-kramp-blue/55 leading-tight">
                  Zaoszczędzone godziny
                </div>
                <div className="text-[19px] font-display font-bold tabular-nums leading-tight text-kramp-blue">
                  {hours(Math.abs(hoursSaved))}
                </div>
              </div>
            </div>
            <div className="w-px self-stretch bg-kramp-blue/15" />
          </>
        )}
        <div className="min-w-0 flex-1 text-right">
          <div className="text-[9px] font-bold uppercase tracking-wider text-kramp-blue/55 leading-tight">
            {impactLabel}
          </div>
          <div className="text-[23px] font-display font-bold tabular-nums leading-tight text-kramp-success">
            {money(Math.abs(impact))}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "h-8 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors px-2 truncate border-2",
        active
          ? "bg-white border-kramp-blue text-kramp-blue"
          : "border-transparent text-kramp-blue/55 hover:text-kramp-blue/80",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 flex-none text-kramp-success"
      fill="none"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
