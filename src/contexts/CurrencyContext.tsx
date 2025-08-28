"use client";

import { createContext, useState, useMemo, type ReactNode } from 'react';
import type { Currency, ExchangeRates } from '@/lib/types';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: ExchangeRates;
  format: (value: number, from?: Currency) => string;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const defaultRates: ExchangeRates = {
  USD: 1,
  EGP: 47.5,
  KWD: 0.31,
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [rates] = useState<ExchangeRates>(defaultRates);

  const format = (value: number, from: Currency = 'USD') => {
    const valueInUsd = value / rates[from];
    const convertedValue = valueInUsd * rates[currency];
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedValue);
  };

  const value = useMemo(() => ({
    currency,
    setCurrency,
    rates,
    format,
  }), [currency, rates]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
