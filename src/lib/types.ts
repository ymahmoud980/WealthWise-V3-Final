export type Currency = string;

export interface HistoryEntry {
  date: string; // ISO String
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

export interface Installment {
  id: string;
  project: string;
  developer: string;
  total: number;
  paid: number;
  amount: number; // Next Installment Amount
  nextDueDate: string;
  currency: Currency;
  frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
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
  
  // 2. Add the documents list (Optional)
  documents?: AssetDocument[]; 
}

export interface UnderDevelopmentAsset {
  id: string;
  name: string;
  location: string;
  purchasePrice: number;
  currentValue: number;
  currency: Currency;
  linkedInstallmentId?: string;
}

export interface CashAsset {
  id: string;
  location: string; // Bank Name or "Wallet"
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
  history?: HistoryEntry[]; // <--- added
}

// Ensure ExchangeRates is compatible with our MarketRates
export type ExchangeRates = any;