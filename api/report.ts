/// <reference types="node" />
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";

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

// Loose shape — the payload arrives as JSON, we only read what we render.
export type ReportData = {
  customer: { name: string; email: string; postalCode: string };
  results: {
    net_benefit: number;
    total_revenue: number;
    total_savings: number;
    total_hours_saved: number;
    m1: { revenue: number; hours_saved: number };
    m2: { revenue: number; hours_saved: number };
    m3: { savings: number };
    m4: { savings: number };
  };
  date: string;
};

// Kramp CVI v1.0 — must match src/index.css @theme tokens.
const RED = "#af000f";
const BLUE = "#121f32";
const TURQUOISE = "#65b994";
const TURQUOISE_TINT = "#eaf3ef";
const GREY = "#6b7280";
const LINE = "#e5e7eb";

const fmtMoney = (n: number) =>
  `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(
    Math.round(n),
  )} zł`;
const fmtHours = (n: number) =>
  `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 }).format(n)} h`;

const s = StyleSheet.create({
  page: {
    padding: 38,
    fontSize: 11,
    color: BLUE,
    fontFamily: "DejaVu",
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: RED,
    color: "#fff",
    padding: 16,
    borderRadius: 6,
  },
  brand: { fontSize: 16, fontWeight: "bold" },
  headerDate: { fontSize: 9, color: "#fff" },

  meta: { marginTop: 18 },
  metaLabel: { fontSize: 8, color: GREY, textTransform: "uppercase" },
  metaValue: { fontSize: 13, fontWeight: "bold", marginTop: 1 },
  metaSub: { fontSize: 9, color: GREY },

  cards: { flexDirection: "row", marginTop: 14 },
  heroCard: {
    flex: 1,
    backgroundColor: RED,
    color: "#fff",
    padding: 16,
    borderRadius: 6,
    marginRight: 5,
  },
  timeCard: {
    flex: 1,
    backgroundColor: BLUE,
    color: "#fff",
    padding: 16,
    borderRadius: 6,
    marginLeft: 5,
  },
  cardLabel: { fontSize: 9, textTransform: "uppercase", opacity: 0.85 },
  cardValue: { fontSize: 24, fontWeight: "bold", marginTop: 6 },
  caption: { fontSize: 8, color: GREY, marginTop: 8 },

  lever: {
    marginTop: 12,
    backgroundColor: TURQUOISE_TINT,
    borderLeft: `3pt solid ${TURQUOISE}`,
    padding: 12,
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leverLabel: { fontSize: 8, color: GREY, textTransform: "uppercase" },
  leverName: { fontSize: 13, fontWeight: "bold" },
  leverValue: { fontSize: 13, fontWeight: "bold" },

  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    color: GREY,
    marginTop: 22,
    marginBottom: 6,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: `1pt solid ${LINE}`,
    paddingVertical: 7,
  },
  rowLabel: { fontWeight: "bold" },
  rowSub: { fontSize: 8, color: GREY },
  rowValue: { fontWeight: "bold" },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    marginTop: 2,
  },
  totalLabel: { fontWeight: "bold", fontSize: 12 },
  totalValue: { fontWeight: "bold", fontSize: 14, color: RED },

  footTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    color: GREY,
    marginTop: 22,
    marginBottom: 4,
    fontWeight: "bold",
  },
  footItem: { fontSize: 10, marginBottom: 2 },
  disclaimer: { marginTop: 16, fontSize: 8, color: "#9ca3af", lineHeight: 1.5 },
});

const el = React.createElement;

function moduleRow(
  key: string,
  label: string,
  sub: string,
  value: number,
): React.ReactElement {
  return el(View, { key, style: s.row }, [
    el(View, { key: "l" }, [
      el(Text, { key: "t", style: s.rowLabel }, label),
      el(Text, { key: "su", style: s.rowSub }, sub),
    ]),
    el(Text, { key: "v", style: s.rowValue }, fmtMoney(Math.abs(value))),
  ]);
}

export function buildReport(data: ReportData): React.ReactElement {
  const { customer, results, date } = data;

  const levers = [
    { name: "Spotkania z dostawcami", value: results.m1.revenue },
    { name: "Proces zamawiania", value: results.m2.revenue },
    { name: "Amortyzacja zapasów", value: results.m3.savings },
    { name: "Transport", value: results.m4.savings },
  ];
  const top = levers.reduce((a, b) => (b.value > a.value ? b : a));

  return el(
    Document,
    {},
    el(Page, { size: "A4", style: s.page }, [
      el(View, { key: "head", style: s.header }, [
        el(Text, { key: "h", style: s.brand }, "KRAMP · Raport oszczędności"),
        el(Text, { key: "d", style: s.headerDate }, date),
      ]),

      el(View, { key: "meta", style: s.meta }, [
        el(Text, { key: "l", style: s.metaLabel }, "Przygotowane dla"),
        el(Text, { key: "n", style: s.metaValue }, customer.name || "—"),
        el(
          Text,
          { key: "e", style: s.metaSub },
          `${customer.email}${customer.postalCode ? " · " + customer.postalCode : ""}`,
        ),
      ]),

      el(View, { key: "cards", style: s.cards }, [
        el(View, { key: "money", style: s.heroCard }, [
          el(Text, { key: "l", style: s.cardLabel }, "Roczna korzyść netto"),
          el(Text, { key: "v", style: s.cardValue }, fmtMoney(results.net_benefit)),
        ]),
        el(View, { key: "time", style: s.timeCard }, [
          el(Text, { key: "l", style: s.cardLabel }, "Odzyskany czas / rok"),
          el(Text, { key: "v", style: s.cardValue }, fmtHours(results.total_hours_saved)),
        ]),
      ]),
      el(
        Text,
        { key: "caption", style: s.caption },
        `Przychód ${fmtMoney(results.total_revenue)} · Oszczędności ${fmtMoney(
          results.total_savings,
        )} · czas zespołu do wykorzystania na sprzedaż`,
      ),

      el(View, { key: "lever", style: s.lever }, [
        el(View, { key: "l" }, [
          el(Text, { key: "lab", style: s.leverLabel }, "Największy potencjał"),
          el(Text, { key: "n", style: s.leverName }, top.name),
        ]),
        el(Text, { key: "v", style: s.leverValue }, fmtMoney(Math.abs(top.value))),
      ]),

      el(Text, { key: "st", style: s.sectionTitle }, "Wpływ wg modułu"),
      moduleRow(
        "m1",
        "1. Spotkania z dostawcami",
        `${fmtHours(results.m1.hours_saved)} odzyskane`,
        results.m1.revenue,
      ),
      moduleRow(
        "m2",
        "2. Proces zamawiania",
        `${fmtHours(results.m2.hours_saved)} odzyskane`,
        results.m2.revenue,
      ),
      moduleRow("m3", "3. Amortyzacja zapasów", "Niższy odpis zapasów", results.m3.savings),
      moduleRow("m4", "4. Transport", "Skonsolidowany transport", results.m4.savings),
      el(View, { key: "total", style: s.totalRow }, [
        el(Text, { key: "l", style: s.totalLabel }, "Razem / rok"),
        el(Text, { key: "v", style: s.totalValue }, fmtMoney(results.net_benefit)),
      ]),

      el(Text, { key: "ft", style: s.footTitle }, "Co wpływa na wynik"),
      el(Text, { key: "f1", style: s.footItem }, "• Ograniczenie liczby dostawców"),
      el(Text, { key: "f2", style: s.footItem }, "• Automatyzacja zamówień"),
      el(Text, { key: "f3", style: s.footItem }, "• Redukcja stanów magazynowych"),
      el(Text, { key: "f4", style: s.footItem }, "• Optymalizacja dostaw"),

      el(
        Text,
        { key: "disc", style: s.disclaimer },
        "Wartości mają charakter orientacyjny i bazują na podanych danych oraz średnich rynkowych. Ostateczna korzyść zależy od zakresu konsolidacji ustalonego z Kramp.",
      ),
    ]),
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
