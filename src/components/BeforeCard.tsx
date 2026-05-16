import type { ReactNode } from "react";

export default function BeforeCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-kramp-blue/15 bg-white px-3 py-2.5 shadow-sm">
      <div className="grid gap-2">{children}</div>
    </div>
  );
}
