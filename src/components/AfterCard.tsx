import type { ReactNode } from "react";

export default function AfterCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-xl bg-kramp-red-tint border border-kramp-red/15 px-3 py-2.5 shadow-sm overflow-hidden">
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1 bg-kramp-red"
      />
      <div className="flex items-center gap-2 mb-2 pl-0.5">
        <span className="inline-flex h-5 px-2 items-center rounded-full bg-kramp-red text-[10px] font-bold uppercase tracking-wider text-white">
          After Kramp
        </span>
      </div>
      <div className="grid gap-2 pl-0.5">{children}</div>
    </div>
  );
}
