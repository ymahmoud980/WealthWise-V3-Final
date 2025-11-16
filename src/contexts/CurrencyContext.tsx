
"use client";

import { createContext, useState, useMemo, type ReactNode } from 'react';
import type { Currency, ExchangeRates } from '@/lib/types';
import { rates as defaultRates } from '@/lib/calculations';

// Constants for conversion
const GRAMS_PER_TROY_OUNCE = 31.1035;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: ExchangeRates;
  format: (value: number) => string;
  goldPricePerOunce: number;
  setGoldPricePerOunce: (price: number) => void;
  silverPricePerOunce: number;
  setSilverPricePerOunce: (price: number) => void;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [currencyRates, setCurrencyRates] = useState<ExchangeRates>(defaultRates);

  // State for user-defined metal prices
  const [goldPricePerOunce, setGoldPricePerOunce] = useState<number>(2330); // Default based on fallback
  const [silverPricePerOunce, setSilverPricePerOunce] = useState<number>(30); // Default price per ounce

  // Combined rates object derived from currency rates and manual metal prices
  const combinedRates = useMemo(() => {
    return {
      ...currencyRates,
      GOLD: goldPricePerOunce / GRAMS_PER_TROY_OUNCE,
      SILVER: silverPricePerOunce / GRAMS_PER_TROY_OUNCE,
    }
  }, [currencyRates, goldPricePerOunce, silverPricePerOunce]);


  const format = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const value = useMemo(() => ({
    currency,
    setCurrency,
    rates: combinedRates,
    format,
    goldPricePerOunce,
    setGoldPricePerOunce,
    silverPricePerOunce,
    setSilverPricePerOunce,
  }), [currency, combinedRates, format, goldPricePerOunce, silverPricePerOunce]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
