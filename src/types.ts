export type Customer = {
  name: string;
  email: string;
  postalCode: string;
};

export const isNameValid = (s: string) => s.trim().length > 1;

export const isEmailValid = (s: string) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim());

// Polish postal code: NN-NNN
export const isPostalValid = (s: string) => /^\d{2}-\d{3}$/.test(s.trim());

export const isCustomerValid = (c: Customer) =>
  isNameValid(c.name) && isEmailValid(c.email) && isPostalValid(c.postalCode);
