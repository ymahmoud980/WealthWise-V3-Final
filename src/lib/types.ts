export type Asset = {
  id: string;
  name: string;
  location: 'Egypt' | 'Turkey';
  type: 'Apartment' | 'Villa' | 'Chalet';
  rentalIncome: number; // in USD
  marketValue: number; // in USD
};

export type Liability = {
  id: string;
  name: string;
  type: 'Real Estate' | 'Loan';
  totalAmount: number; // in USD
  amountPaid: number; // in USD
  dueDate: string;
};

export type UpcomingPayment = {
  id: string;
  name:string;
  amount: number; // in USD
  dueDate: string;
};

export type UpcomingRent = {
  id: string;
  property: string;
  amount: number; // in USD
  dueDate: string;
};

export type CashFlowItem = {
  name: string;
  amount: number; // in USD
  type: 'Income' | 'Expense';
  category: 'Salary' | 'Rental' | 'Household' | 'Installments' | 'Other';
};

export type Currency = 'EGP' | 'USD' | 'KWD';

export type ExchangeRates = {
  [key in Currency]: number;
};
