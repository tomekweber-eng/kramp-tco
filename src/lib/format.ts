// pl-PL grouping uses a non-breaking space by default, so amounts like
// "4 300 000 zł" already render without wrapping mid-number.
const pln = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

const pln1 = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 1,
  useGrouping: true,
});

const num1 = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 1,
  useGrouping: true,
});

export const money = (n: number) => `${pln.format(Math.round(n))} zł`;

export const moneySigned = (n: number) => {
  const v = money(Math.abs(n));
  return n < 0 ? `−${v}` : v;
};

export const moneyFine = (n: number) => `${pln1.format(n)} zł`;

export const hours = (n: number) => `${num1.format(n)} h`;

export const minutes = (n: number) => `${num1.format(n)} min`;

export const percent = (n: number) => `${num1.format(n)}%`;
