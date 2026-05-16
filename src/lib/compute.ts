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
  b_transport_cost: number;
  kramp_freight: number;
  kramp_free_freight_pct: number;
};

export const DEFAULTS: Inputs = {
  // Module 1
  b_suppliers: 50,
  a_suppliers: 25,
  b_meetings: 1, // założenie: jedno spotkanie z dostawcą rocznie
  a_meetings: 1,
  b_duration: 1,
  a_duration: 1,
  turnover_per_hour: 200,

  // Module 2
  orders_per_year: 1175, // ≈ 25 zamówień/tydz. × 47 tygodni
  b_time_find: 3, // założenie: 3 min na znalezienie produktu
  b_time_treat: 5, // założenie: 5 min na przyniesienie z półki

  // Module 3
  b_stock_value: 1_000_000,
  b_pct_depr: 15,
  b_depr_level: 25,
  stock_reduction: 20,
  a_pct_depr: 15,

  // Module 4
  b_transport_cost: 20_000,
  kramp_freight: 20, // stawka Kramp za zamówienie z frachtem płatnym
  kramp_free_freight_pct: 70, // założenie: % zamówień > 300 € (fracht 0 €)
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
    cost_after: number;
    savings: number;
  };
  total_revenue: number;
  total_savings: number;
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

  // Module 4 — Transport (wariant „wszystkie zamówienia przez Kramp")
  // Zakładamy, że część zamówień > 300 € ma fracht 0 € (reguła Kramp);
  // pozostałe płacą stałą stawkę Kramp za zamówienie.
  const m4_paid_orders =
    m2_before_orders * (1 - pct(i.kramp_free_freight_pct));
  const cost_after = m4_paid_orders * i.kramp_freight;
  const m4_savings = i.b_transport_cost - cost_after;

  const total_revenue = m1_revenue + m2_revenue;
  const total_savings = m3_savings + m4_savings;
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
      cost_after: safe(cost_after),
      savings: safe(m4_savings),
    },
    total_revenue: safe(total_revenue),
    total_savings: safe(total_savings),
    net_benefit: safe(net_benefit),
  };
}
