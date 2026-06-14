export type Inputs = {
  // Module 1
  b_suppliers: number;
  a_suppliers: number;
  b_meetings: number;
  a_meetings: number;
  b_duration: number;
  a_duration: number;
  turnover_per_hour: number;

  // Module 2
  orders_per_year: number;
  b_time_find: number;
  b_time_treat: number;

  // Module 3
  b_stock_value: number;
  b_pct_depr: number;
  b_depr_level: number;
  stock_reduction: number;
  a_pct_depr: number;

  // Module 4
  b_cost_per_parcel: number; // średni koszt transportu jednej paczki dziś
  b_pct_kramp: number;
  a_pct_kramp: number;
  kramp_freight: number;
  a_avg_carriage_other: number;
};

export const DEFAULTS: Inputs = {
  // Module 1
  b_suppliers: 50,
  a_suppliers: 25,
  b_meetings: 4,
  a_meetings: 4,
  b_duration: 1,
  a_duration: 1,
  // Kwoty przeliczone z EUR po kursie 4,30 zł/€ i zapisane na stałe (PLN).
  turnover_per_hour: 860, // było 200 €/h

  // Module 2
  orders_per_year: 1175,
  b_time_find: 7,
  b_time_treat: 14,

  // Module 3
  b_stock_value: 4_300_000, // było 1 000 000 €
  b_pct_depr: 15,
  b_depr_level: 25,
  stock_reduction: 20,
  a_pct_depr: 15,

  // Module 4 — roczny koszt liczony jako b_cost_per_parcel × orders_per_year.
  // 73 zł × 1175 ≈ 86 000 zł (poprzedni roczny domyślny koszt transportu).
  b_cost_per_parcel: 73,
  b_pct_kramp: 10,
  a_pct_kramp: 20,
  kramp_freight: 86, // było 20 €
  a_avg_carriage_other: 75.25, // było 17,5 €
};

export type Results = {
  m1: {
    before_h: number;
    after_h: number;
    hours_saved: number;
    revenue: number;
  };
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
    cost_before: number; // roczny koszt transportu dziś (auto z liczby paczek)
    kramp_before: number;
    kramp_after: number;
    other_before: number;
    other_after: number;
    avg_carriage_before: number;
    cost_after: number;
    savings: number;
  };
  total_revenue: number;
  total_savings: number;
  total_hours_saved: number;
  net_benefit: number;
};

const pct = (n: number) => n / 100;
const safe = (n: number) => (Number.isFinite(n) ? n : 0);

export function compute(i: Inputs): Results {
  // Module 1 — Supplier meetings
  const m1_before_h = i.b_suppliers * i.b_meetings * i.b_duration;
  const m1_after_h = i.a_suppliers * i.a_meetings * i.a_duration;
  const m1_hours_saved = m1_before_h - m1_after_h;
  const m1_revenue = m1_hours_saved * i.turnover_per_hour;

  // Module 2 — Order process
  const m2_before_orders = i.orders_per_year;
  const m2_after_orders =
    i.b_suppliers > 0
      ? (i.a_suppliers * i.orders_per_year) / i.b_suppliers
      : 0;
  const coef = i.b_suppliers > 0 ? 1 - i.a_suppliers / i.b_suppliers : 0;
  const a_time_find = i.b_time_find * (1 + coef);
  const a_time_treat = i.b_time_treat * (1 + coef);
  const m2_before_h =
    (m2_before_orders * (i.b_time_find + i.b_time_treat)) / 60;
  const m2_after_h = (m2_after_orders * (a_time_find + a_time_treat)) / 60;
  const m2_hours_saved = m2_before_h - m2_after_h;
  const m2_revenue = m2_hours_saved * i.turnover_per_hour;

  // Module 3 — Stock depreciation
  const a_stock_value = i.b_stock_value * (1 - pct(i.stock_reduction));
  const m3_before_depr =
    i.b_stock_value * pct(i.b_pct_depr) * pct(i.b_depr_level);
  const m3_after_depr =
    a_stock_value * pct(i.a_pct_depr) * pct(i.b_depr_level);
  const m3_savings = m3_before_depr - m3_after_depr;

  // Module 4 — Transport
  // Roczny koszt dziś = średni koszt paczki × liczba zamówień (z modułu 2).
  const m4_cost_before = i.b_cost_per_parcel * m2_before_orders;
  const kramp_before = m2_before_orders * pct(i.b_pct_kramp);
  const kramp_after = m2_after_orders * pct(i.a_pct_kramp);
  const other_before = m2_before_orders - kramp_before;
  const other_after = m2_after_orders - kramp_after;
  const avg_carriage_before =
    other_before > 0
      ? (m4_cost_before - kramp_before * i.kramp_freight) / other_before
      : 0;
  const cost_after =
    kramp_after * i.kramp_freight + other_after * i.a_avg_carriage_other;
  const m4_savings = m4_cost_before - cost_after;

  const total_revenue = m1_revenue + m2_revenue;
  const total_savings = m3_savings + m4_savings;
  const total_hours_saved = m1_hours_saved + m2_hours_saved;
  const net_benefit = total_revenue + total_savings;

  return {
    m1: {
      before_h: safe(m1_before_h),
      after_h: safe(m1_after_h),
      hours_saved: safe(m1_hours_saved),
      revenue: safe(m1_revenue),
    },
    m2: {
      before_orders: safe(m2_before_orders),
      after_orders: safe(m2_after_orders),
      a_time_find: safe(a_time_find),
      a_time_treat: safe(a_time_treat),
      before_h: safe(m2_before_h),
      after_h: safe(m2_after_h),
      hours_saved: safe(m2_hours_saved),
      revenue: safe(m2_revenue),
    },
    m3: {
      a_stock_value: safe(a_stock_value),
      before_depr: safe(m3_before_depr),
      after_depr: safe(m3_after_depr),
      savings: safe(m3_savings),
    },
    m4: {
      cost_before: safe(m4_cost_before),
      kramp_before: safe(kramp_before),
      kramp_after: safe(kramp_after),
      other_before: safe(other_before),
      other_after: safe(other_after),
      avg_carriage_before: safe(avg_carriage_before),
      cost_after: safe(cost_after),
      savings: safe(m4_savings),
    },
    total_revenue: safe(total_revenue),
    total_savings: safe(total_savings),
    total_hours_saved: safe(total_hours_saved),
    net_benefit: safe(net_benefit),
  };
}
