export type Customer = {
  name: string;
  email: string;
  postalCode: string;
};

export const isCustomerValid = (c: Customer) =>
  c.name.trim().length > 1 &&
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email.trim()) &&
  c.postalCode.trim().length >= 2;
