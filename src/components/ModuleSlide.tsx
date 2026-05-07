import type { ReactNode } from "react";
import { hours, money } from "../lib/format";

type Props = {
  index: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  hoursSaved?: number;
  impact: number;
  impactLabel: string;
};

export default function ModuleSlide({
  index,
  title,
  subtitle,
  children,
  hoursSaved,
  impact,
  impactLabel,
}: Props) {
  return (
    <div className="h-full flex flex-col px-4 pt-3 pb-2 overflow-hidden">
      {/* Title row */}
      <div className="flex items-center gap-2.5 mb-2.5 flex-none">
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

      {/* Inputs area — scrolls vertically only if content really overflows */}
      <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1 grid gap-2.5 content-start">
        {children}
      </div>

      {/* Result strip — fixed at bottom of slide */}
      <div className="mt-2.5 flex-none rounded-2xl bg-kramp-blue text-white px-3.5 py-2.5 flex items-center gap-3 shadow-sm">
        {hoursSaved !== undefined && (
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-bold uppercase tracking-wider text-white/55">
              Hours saved
            </div>
            <div className="text-[18px] font-display font-bold tabular-nums leading-tight">
              {hours(Math.abs(hoursSaved))}
            </div>
          </div>
        )}
        {hoursSaved !== undefined && (
          <div className="w-px self-stretch bg-white/15" />
        )}
        <div className="min-w-0 flex-1 text-right">
          <div className="text-[9px] font-bold uppercase tracking-wider text-white/55">
            {impactLabel}
          </div>
          <div className="text-[22px] font-display font-bold tabular-nums leading-tight text-kramp-turquoise">
            {money(Math.abs(impact))}
          </div>
        </div>
      </div>
    </div>
  );
}
