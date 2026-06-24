/// <reference types="node" />
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import { KRAMP_LOGO_DATA_URI } from "./logo.js";

// The built-in PDF fonts (Helvetica) cannot render Polish diacritics, so we
// register DejaVu Sans (full Latin-2 coverage) from a versioned CDN.
Font.register({
  family: "DejaVu",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});
// Avoid mid-word hyphenation of Polish text.
Font.registerHyphenationCallback((word) => [word]);

// Self-contained shape — the payload arrives as JSON (full `inputs` + full
// `results` from compute()). We mirror the fields we render so this module has
// no cross-package import beyond the inlined logo.
export type ReportData = {
  customer: { name: string; email: string; postalCode: string };
  inputs: {
    b_suppliers: number;
    a_suppliers: number;
    b_meetings: number;
    a_meetings: number;
    b_duration: number;
    a_duration: number;
    turnover_per_hour: number;
    orders_per_year: number;
    b_time_find: number;
    b_time_treat: number;
    b_stock_value: number;
    b_pct_depr: number;
    b_depr_level: number;
    stock_reduction: number;
    a_pct_depr: number;
    b_cost_per_parcel: number;
    b_pct_kramp: number;
    a_pct_kramp: number;
    kramp_freight: number;
    a_avg_carriage_other: number;
  };
  results: {
    net_benefit: number;
    total_revenue: number;
    total_savings: number;
    total_hours_saved: number;
    m1: { before_h: number; after_h: number; hours_saved: number; revenue: number };
    m2: {
      before_orders: number;
      after_orders: number;
      a_time_find: number;
      a_time_treat: number;
      before_h: number;
      after_h: number;
      hours_saved: number;
      revenue: number;
    };
    m3: {
      a_stock_value: number;
      before_depr: number;
      after_depr: number;
      savings: number;
    };
    m4: {
      cost_before: number;
      kramp_before: number;
      kramp_after: number;
      other_before: number;
      other_after: number;
      avg_carriage_before: number;
      cost_after: number;
      savings: number;
    };
  };
  date: string;
};

// Kramp CVI v1.0 — must match src/index.css @theme tokens.
const RED = "#af000f";
const BLUE = "#121f32";
const TURQUOISE = "#65b994";
const TURQUOISE_TINT = "#eaf3ef";
const GREY = "#6b7280";
const FAINT = "#9ca3af";
const LINE = "#e5e7eb";
const TRACK = "#eef1f4";

// Kramp Sp. z o.o. — public contact data (kramp.com / identyfikacja).
// TODO: verify before live use; keep in sync with the advisor CTA URL.
const CONTACT = {
  company: "Kramp Sp. z o.o.",
  address: "ul. Skandynawska 1, Modła Królewska, 62-571 Stare Miasto",
  phone: "+48 63 240 67 00",
  email: "info.pl@kramp.com",
  web: "kramp.com",
};

const nf0 = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });
const fmtMoney = (n: number) => `${nf0.format(Math.round(n))} zł`;
const fmtHours = (n: number) => `${nf0.format(Math.round(n))} h`;
const fmtNum = (n: number) => nf0.format(Math.round(n));

const s = StyleSheet.create({
  page: {
    paddingTop: 66,
    paddingBottom: 52,
    paddingHorizontal: 38,
    fontSize: 10.5,
    color: BLUE,
    fontFamily: "DejaVu",
    lineHeight: 1.4,
  },

  // Fixed header / footer (repeat on every page)
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: RED,
    color: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 38,
  },
  logo: { width: 95, height: 14, objectFit: "contain", marginRight: 9 },
  headerRight: { marginLeft: "auto", fontSize: 8.5, opacity: 0.9, textAlign: "right" },

  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 38,
    paddingTop: 7,
    paddingBottom: 14,
    borderTop: `1pt solid ${LINE}`,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footerText: { fontSize: 7.5, color: GREY, lineHeight: 1.35 },
  footerPage: { fontSize: 7.5, color: FAINT },

  // Page 1
  meta: { marginTop: 2 },
  metaLabel: { fontSize: 8, color: GREY, textTransform: "uppercase", letterSpacing: 0.4 },
  metaValue: { fontSize: 14, fontWeight: "bold", marginTop: 4 },
  metaSub: { fontSize: 9, color: GREY, marginTop: 3 },

  pageTitle: { fontSize: 17, fontWeight: "bold", marginTop: 20, color: BLUE, lineHeight: 1.2 },
  intro: { fontSize: 10.5, marginTop: 10, lineHeight: 1.6, color: "#374151" },

  cards: { flexDirection: "row", marginTop: 18 },
  heroCard: {
    flex: 1,
    backgroundColor: RED,
    color: "#fff",
    paddingVertical: 17,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 5,
  },
  timeCard: {
    flex: 1,
    backgroundColor: BLUE,
    color: "#fff",
    paddingVertical: 17,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 5,
  },
  cardLabel: { fontSize: 8.5, textTransform: "uppercase", opacity: 0.85, letterSpacing: 0.4 },
  cardValue: { fontSize: 23, fontWeight: "bold", marginTop: 11, marginBottom: 11, lineHeight: 1.1 },
  cardSub: { fontSize: 8, opacity: 0.8 },

  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    color: GREY,
    marginTop: 11,
    marginBottom: 6,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  // Section title that opens a fresh page (no big top margin under the header).
  sectionTitleTop: {
    fontSize: 9,
    textTransform: "uppercase",
    color: GREY,
    marginTop: 2,
    marginBottom: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // Composition bars (page 1)
  compRow: { marginBottom: 12 },
  compHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  compName: { fontSize: 9.5, fontWeight: "bold" },
  compVal: { fontSize: 9.5, fontWeight: "bold" },
  track: { height: 7, backgroundColor: TRACK, borderRadius: 4 },
  fill: { height: 7, borderRadius: 4 },

  note: {
    marginTop: 22,
    backgroundColor: TURQUOISE_TINT,
    borderLeft: `3pt solid ${TURQUOISE}`,
    borderRadius: 4,
    paddingVertical: 13,
    paddingHorizontal: 13,
  },
  noteTitle: { fontSize: 8.5, fontWeight: "bold", textTransform: "uppercase", color: BLUE, letterSpacing: 0.4, marginBottom: 5 },
  noteText: { fontSize: 9, color: "#374151", lineHeight: 1.55 },

  // Page 2 modules — 2 per page, with generous breathing room.
  module: { marginBottom: 26 },
  modHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 9 },
  modName: { fontSize: 12.5, fontWeight: "bold", color: BLUE, flex: 1, paddingRight: 8 },
  modPill: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: RED,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 11,
  },
  modWhat: { fontSize: 9.5, color: "#374151", lineHeight: 1.6, marginBottom: 14 },
  modWhy: {
    fontSize: 9,
    color: BLUE,
    lineHeight: 1.6,
    marginTop: 14,
    paddingLeft: 10,
    paddingVertical: 3,
    borderLeft: `2pt solid ${TURQUOISE}`,
  },

  barRow: { marginBottom: 9 },
  barTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  barLabel: { fontSize: 8.5, color: GREY },
  barValue: { fontSize: 8.5, fontWeight: "bold", color: BLUE },
  barCaption: { fontSize: 7.5, color: FAINT, marginTop: 4 },

  // Page 4 — inputs / methodology (a reference table; kept on one page).
  grpTitle: { fontSize: 9.5, fontWeight: "bold", color: RED, marginTop: 6, marginBottom: 2 },
  irow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: `0.7pt solid ${LINE}`,
    paddingVertical: 2,
  },
  ilabel: { fontSize: 9, color: "#374151", flex: 1, paddingRight: 10 },
  ivalue: { fontSize: 9, fontWeight: "bold", color: BLUE },
  tableNote: { fontSize: 7.5, color: FAINT, marginTop: 5 },

  bullet: { flexDirection: "row", marginBottom: 3 },
  bulletDot: { fontSize: 9.5, color: RED, marginRight: 6 },
  bulletText: { fontSize: 9.5, color: "#374151", lineHeight: 1.5, flex: 1 },

  // "Co pomaga osiągnąć ten wynik?" — value props in a compact 2-column grid.
  help: {
    marginTop: 9,
    backgroundColor: TURQUOISE_TINT,
    borderLeft: `3pt solid ${TURQUOISE}`,
    borderRadius: 4,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  helpGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
  helpItem: { width: "50%", flexDirection: "row", paddingRight: 8, marginTop: 4 },
  helpDot: { fontSize: 9, color: TURQUOISE, marginRight: 5 },
  helpText: { fontSize: 9, color: "#374151", lineHeight: 1.4, flex: 1 },

  disclaimer: { marginTop: 10, fontSize: 7.5, color: FAINT, lineHeight: 1.5 },
});

const el = React.createElement;

// One before/after bar on a shared scale.
function bar(
  key: string,
  label: string,
  value: string,
  ratio: number,
  color: string,
  caption: string,
): React.ReactElement {
  const pct = `${Math.max(3, Math.min(100, Math.round(ratio * 100)))}%`;
  return el(View, { key, style: s.barRow }, [
    el(View, { key: "t", style: s.barTop }, [
      el(Text, { key: "l", style: s.barLabel }, label),
      el(Text, { key: "v", style: s.barValue }, value),
    ]),
    el(View, { key: "tr", style: s.track }, [
      el(View, { key: "f", style: [s.fill, { width: pct, backgroundColor: color }] }),
    ]),
    el(Text, { key: "c", style: s.barCaption }, caption),
  ]);
}

function inputRow(key: string, label: string, value: string): React.ReactElement {
  return el(View, { key, style: s.irow }, [
    el(Text, { key: "l", style: s.ilabel }, label),
    el(Text, { key: "v", style: s.ivalue }, value),
  ]);
}

function bulletItem(key: string, text: string): React.ReactElement {
  return el(View, { key, style: s.bullet }, [
    el(Text, { key: "d", style: s.bulletDot }, "•"),
    el(Text, { key: "t", style: s.bulletText }, text),
  ]);
}

function helpItem(key: string, text: string): React.ReactElement {
  return el(View, { key, style: s.helpItem }, [
    el(Text, { key: "d", style: s.helpDot }, "•"),
    el(Text, { key: "t", style: s.helpText }, text),
  ]);
}

export function buildReport(data: ReportData): React.ReactElement {
  const { customer, inputs: i, results: r, date } = data;

  // ---- Header & footer (fixed, repeat on every page) -----------------------
  const header = el(View, { key: "hdr", fixed: true, style: s.headerBar }, [
    el(Image, { key: "logo", src: KRAMP_LOGO_DATA_URI, style: s.logo }),
    el(Text, { key: "r", style: s.headerRight }, "Raport potencjału\nkonsolidacji"),
  ]);

  const footer = el(View, { key: "ftr", fixed: true, style: s.footerBar }, [
    el(View, { key: "c" }, [
      el(Text, { key: "1", style: s.footerText }, `${CONTACT.company} · ${CONTACT.address}`),
      el(
        Text,
        { key: "2", style: s.footerText },
        `tel. ${CONTACT.phone} · ${CONTACT.email} · ${CONTACT.web}`,
      ),
    ]),
    el(Text, {
      key: "p",
      style: s.footerPage,
      render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
        `${pageNumber} / ${totalPages}`,
    }),
  ]);

  // ---- Page 1: summary -----------------------------------------------------
  // Sorted by impact, biggest first — so the client immediately sees where the
  // largest potential sits (report-side mirror of the app's "Największy potencjał").
  const levers = [
    { name: "Spotkania z dostawcami", value: r.m1.revenue },
    { name: "Proces zamawiania", value: r.m2.revenue },
    { name: "Amortyzacja zapasów", value: r.m3.savings },
    { name: "Transport", value: r.m4.savings },
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const leverMax = Math.max(1, ...levers.map((l) => Math.abs(l.value)));
  const days = Math.round(r.total_hours_saved / 8);

  const page1 = [
    el(View, { key: "meta", style: s.meta }, [
      el(Text, { key: "l", style: s.metaLabel }, "Przygotowane dla"),
      el(Text, { key: "n", style: s.metaValue }, customer.name || "—"),
      el(
        Text,
        { key: "e", style: s.metaSub },
        `${customer.email}${customer.postalCode ? " · " + customer.postalCode : ""} · ${date}`,
      ),
    ]),

    el(Text, { key: "title", style: s.pageTitle }, "Ile możesz zyskać, upraszczając zaopatrzenie"),
    el(
      Text,
      { key: "intro", style: s.intro },
      "Ten raport pokazuje, ile Twoja firma może zyskać, przenosząc część zaopatrzenia do " +
        "jednego, szerokiego dostawcy. Raport bazuje na podanych danych i przejrzystych założeniach " +
        "opisanych na końcu dokumentu. Każdą kwotę możesz prześledzić krok po kroku.",
    ),

    el(View, { key: "cards", style: s.cards }, [
      el(View, { key: "m", style: s.heroCard }, [
        el(Text, { key: "l", style: s.cardLabel }, "Szacowany potencjał biznesowy"),
        el(Text, { key: "v", style: s.cardValue }, fmtMoney(r.net_benefit)),
        el(Text, { key: "s", style: s.cardSub }, "Potencjał z odzyskanego czasu i ograniczenia kosztów"),
      ]),
      el(View, { key: "t", style: s.timeCard }, [
        el(Text, { key: "l", style: s.cardLabel }, "Odzyskany czas / rok"),
        el(Text, { key: "v", style: s.cardValue }, fmtHours(r.total_hours_saved)),
        el(Text, { key: "s", style: s.cardSub }, `≈ ${days} dni roboczych z powrotem dla zespołu`),
      ]),
    ]),

    el(Text, { key: "ct", style: s.sectionTitle }, "Największy potencjał"),
    ...levers.map((l, idx) =>
      el(View, { key: `comp${idx}`, style: s.compRow }, [
        el(View, { key: "h", style: s.compHead }, [
          el(Text, { key: "n", style: s.compName }, l.name),
          el(Text, { key: "v", style: s.compVal }, fmtMoney(Math.abs(l.value))),
        ]),
        el(View, { key: "tr", style: s.track }, [
          el(View, {
            key: "f",
            style: [
              s.fill,
              {
                width: `${Math.max(3, Math.round((Math.abs(l.value) / leverMax) * 100))}%`,
                backgroundColor: idx < 2 ? RED : TURQUOISE,
              },
            ],
          }),
        ]),
      ]),
    ),

    el(View, { key: "note", style: s.note }, [
      el(Text, { key: "t", style: s.noteTitle }, "Jak czytać ten raport"),
      el(
        Text,
        { key: "x", style: s.noteText },
        "Wartość odzyskanego czasu to czas zespołu odzyskany dzięki prostszej obsłudze, przeliczony " +
          "na pieniądze przez Twój obrót na godzinę. Oszczędności to niższe koszty zapasu i transportu. " +
          "Każda dźwignia jest rozpisana na kolejnych stronach, a wszystkie założenia — na końcu raportu.",
      ),
    ]),

    el(View, { key: "help", style: s.help, wrap: false }, [
      el(Text, { key: "t", style: s.noteTitle }, "Co pomaga osiągnąć ten wynik?"),
      el(View, { key: "g", style: s.helpGrid }, [
        helpItem("h1", "Szeroki asortyment w jednym miejscu"),
        helpItem("h2", "Mniejsza liczba dostawców"),
        helpItem("h3", "Zamówienia online 24/7"),
        helpItem("h4", "Dostawa następnego dnia"),
        helpItem("h5", "Wysoka dostępność produktów"),
        helpItem("h6", "Wsparcie doradcy Kramp"),
      ]),
    ]),
  ];

  // ---- Page 2: the four levers --------------------------------------------
  const m1Max = Math.max(1, r.m1.before_h, r.m1.after_h);
  const m2Max = Math.max(1, r.m2.before_h, r.m2.after_h);
  const m3Max = Math.max(1, r.m3.before_depr, r.m3.after_depr);
  const m4Max = Math.max(1, r.m4.cost_before, r.m4.cost_after);

  const moduleBlock = (
    key: string,
    n: number,
    name: string,
    value: number,
    what: string,
    bars: React.ReactElement[],
    why: string,
  ): React.ReactElement =>
    el(View, { key, style: s.module, wrap: false }, [
      el(View, { key: "h", style: s.modHead }, [
        el(Text, { key: "n", style: s.modName }, `${n}. ${name}`),
        el(Text, { key: "p", style: s.modPill }, `+ ${fmtMoney(Math.abs(value))}`),
      ]),
      el(Text, { key: "w", style: s.modWhat }, what),
      ...bars,
      el(Text, { key: "y", style: s.modWhy }, why),
    ]);

  const page2a = el(View, { key: "p2a", break: true }, [
    el(Text, { key: "st", style: s.sectionTitleTop }, "Cztery dźwignie — skąd bierze się wynik"),

    moduleBlock(
      "m1",
      1,
      "Spotkania z dostawcami",
      r.m1.revenue,
      "Co liczymy: czas, który Twój zespół spędza rocznie na spotkaniach z dostawcami — i ile z niego wraca przy mniejszej ich liczbie.",
      [
        bar(
          "b",
          "Dziś",
          fmtHours(r.m1.before_h),
          r.m1.before_h / m1Max,
          BLUE,
          `${fmtNum(i.b_suppliers)} dostawców × ${fmtNum(i.b_meetings)} spotkań × ${fmtNum(i.b_duration)} h`,
        ),
        bar(
          "a",
          "Scenariusz z Kramp",
          fmtHours(r.m1.after_h),
          r.m1.after_h / m1Max,
          TURQUOISE,
          `${fmtNum(i.a_suppliers)} dostawców — ${fmtHours(r.m1.hours_saved)} odzyskane × ${fmtMoney(i.turnover_per_hour)}/h`,
        ),
      ],
      "Dlaczego to dla Ciebie ważne: mniej dostawców to mniej kalendarza zjedzonego na koordynację. Ten czas wraca do sprzedaży i obsługi klienta — tam, gdzie realnie zarabiasz.",
    ),

    moduleBlock(
      "m2",
      2,
      "Proces zamawiania",
      r.m2.revenue,
      "Co liczymy: łączny czas wyszukiwania produktów i przyjęcia dostaw na wszystkich zamówieniach w roku.",
      [
        bar(
          "b",
          "Dziś",
          fmtHours(r.m2.before_h),
          r.m2.before_h / m2Max,
          BLUE,
          `${fmtNum(r.m2.before_orders)} zamówień × (${fmtNum(i.b_time_find)} + ${fmtNum(i.b_time_treat)}) min`,
        ),
        bar(
          "a",
          "Scenariusz z Kramp",
          fmtHours(r.m2.after_h),
          r.m2.after_h / m2Max,
          TURQUOISE,
          `${fmtNum(r.m2.after_orders)} zamówień — ${fmtHours(r.m2.hours_saved)} odzyskane × ${fmtMoney(i.turnover_per_hour)}/h`,
        ),
      ],
      "Dlaczego to dla Ciebie ważne: jedno źródło to jeden koszyk, jedna dostawa, jedna faktura. Mniej klikania, mniej przyjęć na rampie i mniej pomyłek.",
    ),
  ]);

  const page2b = el(View, { key: "p2b", break: true }, [
    el(Text, { key: "st", style: s.sectionTitleTop }, "Skąd bierze się wynik — ciąg dalszy"),

    moduleBlock(
      "m3",
      3,
      "Amortyzacja zapasów",
      r.m3.savings,
      "Co liczymy: koszt starzenia się magazynu — wartość, którą co roku odpisujesz na zalegający towar.",
      [
        bar(
          "b",
          "Dziś",
          fmtMoney(r.m3.before_depr),
          r.m3.before_depr / m3Max,
          BLUE,
          `zapas ${fmtMoney(i.b_stock_value)} · ${fmtNum(i.b_pct_depr)}% podlega odpisom`,
        ),
        bar(
          "a",
          "Scenariusz z Kramp",
          fmtMoney(r.m3.after_depr),
          r.m3.after_depr / m3Max,
          TURQUOISE,
          `zapas ${fmtMoney(r.m3.a_stock_value)} (−${fmtNum(i.stock_reduction)}% dzięki dostępności od ręki)`,
        ),
      ],
      "Dlaczego to dla Ciebie ważne: nie musisz trzymać wszystkiego „na wszelki wypadek”. Mniej martwego towaru to więcej gotówki w obrocie.",
    ),

    moduleBlock(
      "m4",
      4,
      "Transport",
      r.m4.savings,
      "Co liczymy: roczny koszt dostaw i to, jak spada, gdy więcej paczek idzie przez jednego dostawcę z lepszą stawką.",
      [
        bar(
          "b",
          "Dziś",
          fmtMoney(r.m4.cost_before),
          r.m4.cost_before / m4Max,
          BLUE,
          `${fmtNum(r.m2.before_orders)} przesyłek · średnio ${fmtMoney(i.b_cost_per_parcel)}/paczkę`,
        ),
        bar(
          "a",
          "Scenariusz z Kramp",
          fmtMoney(r.m4.cost_after),
          r.m4.cost_after / m4Max,
          TURQUOISE,
          `udział Kramp ${fmtNum(i.b_pct_kramp)}% → ${fmtNum(i.a_pct_kramp)}% · mniej drobnych przesyłek`,
        ),
      ],
      "Dlaczego to dla Ciebie ważne: mniej drobnych przesyłek od wielu dostawców, więcej skonsolidowanych dostaw. Niższy koszt jednostkowy i krótsze oczekiwanie na towar.",
    ),
  ]);

  // ---- Page 3: inputs, method, next step ----------------------------------
  const page3 = el(View, { key: "p3", break: true }, [
    el(Text, { key: "st", style: s.sectionTitleTop }, "Twoje dane i założenia"),

    el(Text, { key: "g1", style: s.grpTitle }, "Spotkania z dostawcami"),
    inputRow("g1a", "Liczba dostawców (dziś → docelowo)", `${fmtNum(i.b_suppliers)} → ${fmtNum(i.a_suppliers)}`),
    inputRow("g1b", "Spotkania na rok / czas spotkania", `${fmtNum(i.b_meetings)} × ${fmtNum(i.b_duration)} h`),
    inputRow("g1c", "Obrót na godzinę pracy", `${fmtMoney(i.turnover_per_hour)}`),

    el(Text, { key: "g2", style: s.grpTitle }, "Proces zamawiania"),
    inputRow("g2a", "Zamówienia na rok", fmtNum(i.orders_per_year)),
    inputRow("g2b", "Czas wyszukania / przyjęcia 1 zamówienia", `${fmtNum(i.b_time_find)} + ${fmtNum(i.b_time_treat)} min`),

    el(Text, { key: "g3", style: s.grpTitle }, "Amortyzacja zapasów"),
    inputRow("g3a", "Wartość zapasu", fmtMoney(i.b_stock_value)),
    inputRow("g3b", "Udział podlegający odpisom / poziom odpisu", `${fmtNum(i.b_pct_depr)}% · ${fmtNum(i.b_depr_level)}%`),
    inputRow("g3c", "Redukcja zapasu po konsolidacji", `−${fmtNum(i.stock_reduction)}%`),

    el(Text, { key: "g4", style: s.grpTitle }, "Transport"),
    inputRow("g4a", "Średni koszt przesyłki dziś", fmtMoney(i.b_cost_per_parcel)),
    inputRow("g4b", "Udział paczek przez Kramp (dziś → docelowo)", `${fmtNum(i.b_pct_kramp)}% → ${fmtNum(i.a_pct_kramp)}%`),
    inputRow("g4c", "Stawka frachtu Kramp / pozostali", `${fmtMoney(i.kramp_freight)} · ${fmtMoney(i.a_avg_carriage_other)}`),

    el(
      Text,
      { key: "inote", style: s.tableNote },
      "* Wartości wstępne oparte na średnich rynkowych — możesz je nadpisać własnymi danymi.",
    ),

    el(Text, { key: "st2", style: s.sectionTitle }, "Jak to liczymy"),
    bulletItem("mb1", "Wartość odzyskanego czasu = odzyskane godziny × Twój obrót na godzinę pracy."),
    bulletItem(
      "mb2",
      "Liczba zamówień i koszty transportu skalują się udziałem jednego dostawcy — dlatego zmiana liczby dostawców porusza cały wynik.",
    ),
    bulletItem("mb3", "Oszczędność = koszt dziś − koszt po konsolidacji."),
    bulletItem("mb4", "Szacowany potencjał = wartość odzyskanego czasu + oszczędności kosztów."),

    el(Text, { key: "st3", style: s.sectionTitle }, "Co wpływa na wynik"),
    bulletItem("wb1", "Im większa różnica między liczbą dostawców dziś a docelowo, tym większy efekt."),
    bulletItem("wb2", "Wartości są orientacyjne i bazują na Twoich danych oraz średnich rynkowych."),
    bulletItem("wb3", "Ostateczny zakres ustalasz wspólnie z doradcą Kramp."),

    el(
      Text,
      { key: "disc", style: s.disclaimer },
      "Wartości mają charakter orientacyjny i bazują na podanych danych oraz średnich rynkowych. " +
        "Raport nie stanowi oferty w rozumieniu przepisów prawa; ostateczna korzyść zależy od zakresu " +
        "konsolidacji ustalonego z Kramp.",
    ),
  ]);

  return el(
    Document,
    {},
    el(Page, { size: "A4", style: s.page }, [header, footer, ...page1, page2a, page2b, page3]),
  );
}

export async function renderReportPdf(data: ReportData): Promise<Buffer> {
  // buildReport returns a generic ReactElement; renderToBuffer wants the
  // Document element type specifically. The root IS a <Document>, so cast
  // to exactly the parameter type renderToBuffer expects.
  return renderToBuffer(
    buildReport(data) as Parameters<typeof renderToBuffer>[0],
  );
}
