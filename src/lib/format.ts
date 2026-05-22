const eur = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

const eur1 = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 1,
  useGrouping: true,
});

const num1 = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 1,
  useGrouping: true,
});

export const money = (n: number) =>
  `${eur.format(Math.round(n)).replace(/ /g, " ")} €`;

export const moneySigned = (n: number) => {
  const v = money(Math.abs(n));
  return n < 0 ? `−${v}` : v;
};

export const moneyFine = (n: number) =>
  `${eur1.format(n).replace(/ /g, " ")} €`;

export const hours = (n: number) => `${num1.format(n)} h`;

export const minutes = (n: number) => `${num1.format(n)} min`;

export const percent = (n: number) => `${num1.format(n)}%`;
