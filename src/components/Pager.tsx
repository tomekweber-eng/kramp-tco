import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";

export type PagerHandle = {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
};

type Props = {
  children: ReactNode[];
  onIndexChange?: (i: number) => void;
};

export const Pager = forwardRef<PagerHandle, Props>(function Pager(
  { children, onIndexChange },
  ref,
) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    goTo: (i: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
    },
    next: () => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollBy({ left: el.clientWidth, behavior: "smooth" });
    },
    prev: () => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollBy({ left: -el.clientWidth, behavior: "smooth" });
    },
  }));

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth;
        if (!w) return;
        const i = Math.round(el.scrollLeft / w);
        onIndexChange?.(i);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [onIndexChange]);

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">
      <div
        ref={scrollerRef}
        className="h-full w-full overflow-x-auto overflow-y-hidden flex snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className="flex-none w-full h-full snap-start snap-always overflow-hidden"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
});

export function PagerNav({
  count,
  active,
  onJump,
  onPrev,
  onNext,
  highlight,
}: {
  count: number;
  active: number;
  onJump: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
  highlight?: number;
}) {
  const canPrev = active > 0;
  const canNext = active < count - 1;
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2">
      <button
        type="button"
        aria-label="Previous"
        onClick={onPrev}
        disabled={!canPrev}
        className={[
          "w-9 h-9 grid place-items-center rounded-full transition-colors",
          canPrev
            ? "bg-kramp-blue/[0.06] text-kramp-blue hover:bg-kramp-blue/[0.12] active:bg-kramp-blue/[0.18]"
            : "text-kramp-blue/20 cursor-not-allowed",
        ].join(" ")}
      >
        <Chevron dir="left" />
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: count }).map((_, i) => {
          const isActive = i === active;
          const isHighlight = i === highlight;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Go to page ${i + 1}`}
              onClick={() => onJump(i)}
              className={[
                "h-2 rounded-full transition-all duration-200",
                isActive
                  ? isHighlight
                    ? "w-6 bg-kramp-red"
                    : "w-6 bg-kramp-blue"
                  : isHighlight
                    ? "w-2 bg-kramp-red/55"
                    : "w-2 bg-kramp-blue/25 hover:bg-kramp-blue/40",
              ].join(" ")}
            />
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Next"
        onClick={onNext}
        disabled={!canNext}
        className={[
          "w-9 h-9 grid place-items-center rounded-full transition-colors",
          canNext
            ? "bg-kramp-red text-white shadow-sm hover:bg-kramp-red-dark active:scale-[0.97]"
            : "bg-kramp-blue/[0.06] text-kramp-blue/30 cursor-not-allowed",
        ].join(" ")}
      >
        <Chevron dir="right" />
      </button>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
      <path
        d={dir === "left" ? "M12 5L7 10l5 5" : "M8 5l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
