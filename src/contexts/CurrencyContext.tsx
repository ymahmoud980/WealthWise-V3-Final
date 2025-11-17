
"use client";

import { createContext, useState, useMemo, type ReactNode, useEffect, useCallback } from 'react';
import type { Currency, ExchangeRates } from '@/lib/types';

// Constants for conversion
const GRAMS_PER_TROY_OUNCE = 31.1035;

// Base currency rates are stable and can be defined outside the component.
const currencyRates: Omit<ExchangeRates, 'GOLD_GRAM' | 'SILVER_GRAM'> = { 
  USD: 1, 
  EGP: 47.75, 
  KWD: 0.3072, 
  TRY: 41.88 
};

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

  // State for user-defined metal prices, initialized from localStorage or defaults.
  const [goldPricePerOunce, setGoldPricePerOunce] = useState<number>(() => {
    if (typeof window !== 'undefined') {
        const savedGoldPrice = localStorage.getItem('goldPricePerOunce');
        return savedGoldPrice ? parseFloat(savedGoldPrice) : 4080;
    }
    return 4080;
  });
  const [silverPricePerOunce, setSilverPricePerOunce] = useState<number>(() => {
    if (typeof window !== 'undefined') {
        const savedSilverPrice = localStorage.getItem('silverPricePerOunce');
        return savedSilverPrice ? parseFloat(savedSilverPrice) : 50;
    }
    return 50;
  });

  // Effect to save gold price to localStorage whenever it changes.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('goldPricePerOunce', goldPricePerOunce.toString());
    }
  }, [goldPricePerOunce]);
  
  // Effect to save silver price to localStorage whenever it changes.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('silverPricePerOunce', silverPricePerOunce.toString());
    }
  }, [silverPricePerOunce]);


  // Combined rates object derived from currency rates and manual metal prices
  const combinedRates = useMemo(() => {
    const goldPricePerGram = goldPricePerOunce / GRAMS_PER_TROY_OUNCE;
    const silverPricePerGram = silverPricePerOunce / GRAMS_PER_TROY_OUNCE;
    
    return {
      ...currencyRates,
      GOLD_GRAM: goldPricePerGram,
      SILVER_GRAM: silverPricePerGram,
    } as ExchangeRates;
  }, [goldPricePerOunce, silverPricePerOunce]);


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
