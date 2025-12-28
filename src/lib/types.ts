export type Currency = string;

export interface Installment {
  id: string;
  project: string;
  developer: string;
  total: number; // This should be Base + Maint + Parking
  paid: number;
  amount: number; // Next Installment Amount
  nextDueDate: string;
  currency: Currency;
  frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'One-Time';
}

export interface Loan {
  id: string;
  lender: string;
  initial: number;
  remaining: number;
  monthlyPayment: number;
  currency: Currency;
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
}

export interface UnderDevelopmentAsset {
  id: string;
  name: string;
  location: string;
  purchasePrice: number; // Base Price
  currentValue: number;
  currency: Currency;
  linkedInstallmentId?: string;
  
  // --- NEW FIELDS ---
  maintenanceCost?: number;
  maintenanceDueDate?: string;
  parkingCost?: number;
  // We use these to calculate the "Total Contract Value"
}

export interface CashAsset {
  id: string;
  location: string;
  amount: number;
  currency: Currency;
}

export interface GoldAsset {
  id: string;
  location: string;
  grams: number;
}

export interface SilverAsset {
  id: string;
  location: string;
  grams: number;
}

export interface OtherAsset {
  id: string;
  description: string;
  value: number;
  currency: Currency;
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