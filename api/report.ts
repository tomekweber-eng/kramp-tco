/// <reference types="node" />
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

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

const KRAMP_RED = "#e2001a";
const KRAMP_BLUE = "#121f32";

const fmtMoney = (n: number) =>
  `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(
    Math.round(n),
  )} zł`;
const fmtHours = (n: number) =>
  `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 }).format(n)} h`;

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 11, color: KRAMP_BLUE, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: KRAMP_RED,
    color: "#fff",
    padding: 14,
    borderRadius: 6,
  },
  h1: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  meta: { marginTop: 18, marginBottom: 6 },
  metaLabel: { fontSize: 8, color: "#6b7280", textTransform: "uppercase" },
  metaValue: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  hero: {
    marginTop: 14,
    backgroundColor: KRAMP_RED,
    color: "#fff",
    padding: 16,
    borderRadius: 6,
  },
  heroLabel: { fontSize: 9, textTransform: "uppercase", opacity: 0.85 },
  heroValue: { fontSize: 30, fontFamily: "Helvetica-Bold", marginTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1pt solid #e5e7eb",
    paddingVertical: 7,
  },
  rowLabel: { fontFamily: "Helvetica-Bold" },
  rowSub: { fontSize: 8, color: "#6b7280" },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#6b7280",
    marginTop: 20,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  footer: { marginTop: 24, fontSize: 8, color: "#9ca3af", lineHeight: 1.5 },
});

const el = React.createElement;

function moduleRow(
  label: string,
  sub: string,
  value: number,
): React.ReactElement {
  return el(View, { style: s.row }, [
    el(View, { key: "l" }, [
      el(Text, { key: "t", style: s.rowLabel }, label),
      el(Text, { key: "su", style: s.rowSub }, sub),
    ]),
    el(Text, { key: "v", style: s.rowLabel }, fmtMoney(Math.abs(value))),
  ]);
}

export function buildReport(data: ReportData): React.ReactElement {
  const { customer, results, date } = data;

  return el(
    Document,
    {},
    el(Page, { size: "A4", style: s.page }, [
      el(View, { key: "head", style: s.header }, [
        el(Text, { key: "h", style: s.h1 }, "KRAMP · Raport oszczędności"),
        el(Text, { key: "d", style: { fontSize: 9 } }, date),
      ]),

      el(View, { key: "meta", style: s.meta }, [
        el(Text, { key: "l", style: s.metaLabel }, "Przygotowane dla"),
        el(Text, { key: "n", style: s.metaValue }, customer.name || "—"),
        el(
          Text,
          { key: "e", style: { fontSize: 9, color: "#6b7280" } },
          `${customer.email}${customer.postalCode ? " · " + customer.postalCode : ""}`,
        ),
      ]),

      el(View, { key: "hero", style: s.hero }, [
        el(Text, { key: "l", style: s.heroLabel }, "Roczna korzyść netto"),
        el(Text, { key: "v", style: s.heroValue }, fmtMoney(results.net_benefit)),
        el(
          Text,
          { key: "t", style: { fontSize: 9, opacity: 0.85, marginTop: 2 } },
          `Odzyskany czas: ${fmtHours(results.total_hours_saved)} / rok`,
        ),
      ]),

      el(Text, { key: "st", style: s.sectionTitle }, "Wpływ wg modułu"),
      moduleRow(
        "1. Spotkania z dostawcami",
        `${fmtHours(results.m1.hours_saved)} odzyskane`,
        results.m1.revenue,
      ),
      moduleRow(
        "2. Proces zamawiania",
        `${fmtHours(results.m2.hours_saved)} odzyskane`,
        results.m2.revenue,
      ),
      moduleRow("3. Amortyzacja zapasów", "Niższy odpis zapasów", results.m3.savings),
      moduleRow("4. Transport", "Skonsolidowany transport", results.m4.savings),

      el(Text, { key: "ft", style: s.footer }, [
        "Co wpływa na wynik: ograniczenie liczby dostawców, automatyzacja zamówień, redukcja stanów magazynowych, optymalizacja dostaw.\n",
        "Wartości mają charakter orientacyjny i bazują na podanych danych oraz średnich rynkowych. Ostateczna korzyść zależy od zakresu konsolidacji ustalonego z Kramp.",
      ]),
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
