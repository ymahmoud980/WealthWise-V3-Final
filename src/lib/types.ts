

export type Currency = 'EGP' | 'USD' | 'KWD' | 'TRY';

export type ExchangeRates = {
  [key in Currency | 'GOLD_GRAM' | 'SILVER_GRAM']: number;
};

export interface RealEstateAsset {
  id: string;
  name: string;
  location: string;
  currentValue: number;
  currency: Currency;
  monthlyRent: number;
  rentCurrency?: Currency;
  rentDueDay: number;
  rentFrequency: 'monthly' | 'semi-annual';
  nextRentDueDate: string;
}

export interface UnderDevelopmentAsset {
  id: string;
  name: string;
  location: string;
  purchasePrice: number;
  currentValue: number;
  currency: Currency;
  linkedInstallmentId: string;
}

export interface CashAsset {
  id: string;
  location: string;
  amount: number;
  currency: Currency;
}

export interface GoldAsset {
  id: string;
  description: string;
  grams: number;
}

export interface SilverAsset {
  id: string;
  description: string;
  grams: number;
}

export interface OtherAsset {
  id: string;
  description: string;
  value: number;
  currency: Currency;
}

export interface Salary {
    id: string;
    amount: number;
    currency: Currency;
}

export interface Assets {
  realEstate: RealEstateAsset[];
  underDevelopment: UnderDevelopmentAsset[];
  cash: CashAsset[];
  gold: GoldAsset[];
  silver: SilverAsset[];
  otherAssets: OtherAsset[];
  salary: Salary;
}

export interface Loan {
  id: string;
  lender: string;
  initial: number;
  remaining: number;
  currency: Currency;
  monthlyPayment: number;
  finalPayment: string;
}

export interface Installment {
  id: string;
  project: string;
  developer: string;
  total: number;
  paid: number;
  currency: Currency;
  nextDueDate: string;
  amount: number;
  frequency: 'Annual' | 'Semi-Annual' | 'Quarterly';
}

export interface Liabilities {
  loans: Loan[];
  installments: Installment[];
}

export interface HouseholdExpense {
    id: string;
    description: string;
    amount: number;
    currency: Currency;
}
export interface MonthlyExpenses {
    household: HouseholdExpense[];
}

export interface HistoryEntry {
  date: string; // ISO string
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  netCashFlow: number;
}

export interface FinancialData {
    assets: Assets;
    liabilities: Liabilities;
    monthlyExpenses: MonthlyExpenses;
    history: HistoryEntry[];
    lastUpdated?: any;
}

export interface DocumentedItem { 
  id: string;
  name: string;
};

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
}
