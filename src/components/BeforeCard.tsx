import type { ReactNode } from "react";

export default function BeforeCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-kramp-blue/15 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex h-5 px-2 items-center rounded-full bg-kramp-blue/[0.08] text-[10px] font-bold uppercase tracking-wider text-kramp-blue/70">
          Przed
        </span>
      </div>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}
