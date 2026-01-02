export type Currency = string;

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  description: string;
}

export interface Installment {
  id: string;
  project: string;
  developer: string;
  total: number;
  paid: number;
  amount: number; // Next Immediate Payment
  nextDueDate: string;
  currency: Currency;
  frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'One-Time';
  
  paymentHistory?: PaymentRecord[]; // Past
  schedule?: PaymentRecord[];       // Full Plan (Past + Future)
  notes?: string;
}

export interface Loan {
  id: string;
  lender: string;
  initial: number;
  remaining: number;
  monthlyPayment: number;
  currency: Currency;
  notes?: string;
}

export interface RealEstateAsset {
  id: string;
  name: string;
  location: string;
  currentValue: number;
  purchasePrice: number;
  currency: Currency;
  monthlyRent: number;
  rentCurrency?: Currency;
  rentFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  nextRentDueDate: string;
  documents?: any[];
  notes?: string;
}

export interface UnderDevelopmentAsset {
  id: string;
  name: string;
  location: string;
  purchasePrice: number;
  currentValue: number;
  currency: Currency;
  linkedInstallmentId?: string;
  maintenanceCost?: number;
  maintenanceDueDate?: string;
  parkingCost?: number;
  paymentFrequency?: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  documents?: any[];
  notes?: string;
}

export interface CashAsset {
  id: string;
  location: string;
  amount: number;
  currency: Currency;
  notes?: string;
}

export interface GoldAsset {
  id: string;
  location: string;
  grams: number;
  notes?: string;
}

export interface SilverAsset {
  id: string;
  location: string;
  grams: number;
  notes?: string;
}

export interface OtherAsset {
  id: string;
  description: string;
  value: number;
  currency: Currency;
  notes?: string;
}

export interface HouseholdExpense {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
}

export interface FinancialData {
  assets: {
    realEstate: RealEstateAsset[];
    underDevelopment: UnderDevelopmentAsset[];
    cash: CashAsset[];
    gold: GoldAsset[];
    silver: SilverAsset[];
    otherAssets: OtherAsset[];
    salary: { amount: number; currency: Currency };
  };
  liabilities: {
    loans: Loan[];
    installments: Installment[];
  };
  monthlyExpenses: {
    household: HouseholdExpense[];
  };
}

export type ExchangeRates = any;