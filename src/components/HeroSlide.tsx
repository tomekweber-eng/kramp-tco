import heroImg from "../assets/hero-kramp.png";

type Props = {
  onStart: () => void;
};

export default function HeroSlide({ onStart }: Props) {
  return (
    <div className="h-full flex flex-col bg-kramp-red text-white relative overflow-hidden">
      {/* Subtle prism shapes in the corners (Kramp brandbook style) */}
      <svg
        aria-hidden
        className="absolute -top-3 -left-3 opacity-90"
        width="120"
        height="120"
        viewBox="0 0 120 120"
      >
        <polygon points="0,0 84,0 0,52" fill="#65b994" />
        <polygon points="0,52 0,90 28,90" fill="#121f32" />
      </svg>
      <svg
        aria-hidden
        className="absolute -bottom-2 -right-2 opacity-95"
        width="140"
        height="140"
        viewBox="0 0 140 140"
      >
        <polygon points="140,0 140,90 70,140" fill="#121f32" />
        <polygon points="140,90 140,140 90,140" fill="#e39a0a" />
      </svg>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col px-5 pt-5 pb-5">
        {/* Tiny top label */}
        <div className="flex items-center gap-2 flex-none">
          <span className="inline-flex h-6 px-2.5 items-center rounded-full bg-white/15 backdrop-blur-sm text-[10.5px] font-bold uppercase tracking-wider">
            Kalkulator oszczędności
          </span>
          <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold opacity-75">
            v1.0
          </span>
        </div>

        {/* Brandmark — large, centred */}
        <div className="flex-1 grid place-items-center my-2">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 rounded-[28px] bg-white/10 blur-2xl"
            />
            <img
              src={heroImg}
              alt="Kramp"
              className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-[24px] shadow-2xl ring-1 ring-white/15 object-cover"
              draggable={false}
            />
          </div>
        </div>

        {/* Hero copy */}
        <div className="flex-none mb-4">
          <h1 className="font-display text-[30px] leading-[1.04] font-bold uppercase tracking-tight">
            Przekonaj się,
            <br />
            ile <span className="text-kramp-turquoise">zaoszczędzisz</span> z
            Kramp.
          </h1>
          <p className="mt-2 text-[13.5px] leading-snug text-white/85 max-w-[310px]">
            Odpowiedz na kilka pytań i zobacz, gdzie możesz odzyskać czas,
            ograniczyć koszty i usprawnić codzienną pracę.
          </p>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onStart}
          className="flex-none w-full h-12 rounded-2xl bg-white text-kramp-red font-display font-bold uppercase tracking-wide text-[15px] shadow-lg active:scale-[0.99] hover:bg-white/95 transition-transform flex items-center justify-center gap-2"
        >
          Policz swoje oszczędności
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
            <path
              d="M5 10h10m-4-4 4 4-4 4"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <ul className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[10.5px] text-white/75 mt-2.5">
          {["około 2 minuty", "tylko kilka danych", "raport PDF na końcu"].map(
            (t) => (
              <li key={t} className="inline-flex items-center gap-1">
                <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none">
                  <path
                    d="M3 8.5l3 3 7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t}
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}
