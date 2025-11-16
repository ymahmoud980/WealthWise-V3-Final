
"use client";

import { createContext, useState, useMemo, type ReactNode, useEffect } from 'react';
import type { Currency, ExchangeRates } from '@/lib/types';
import { rates as defaultRates } from '@/lib/calculations';
import { useToast } from '@/hooks/use-toast';

// Constants for conversion
const GRAMS_PER_TROY_OUNCE = 31.1035;
const GRAMS_PER_KILOGRAM = 1000;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: ExchangeRates;
  format: (value: number) => string;
  goldPricePerOunce: number;
  setGoldPricePerOunce: (price: number) => void;
  silverPricePerKg: number;
  setSilverPricePerKg: (price: number) => void;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [currencyRates, setCurrencyRates] = useState<ExchangeRates>(defaultRates);
  const { toast } = useToast();

  // State for user-defined metal prices
  const [goldPricePerOunce, setGoldPricePerOunce] = useState<number>(2330); // Default based on fallback
  const [silverPricePerKg, setSilverPricePerKg] = useState<number>(945); // Default based on fallback

  useEffect(() => {
    const fetchCurrencyRates = async () => {
      let finalRates = { ...defaultRates };
      let currencyApiError = false;
      
      try {
        const currencyApiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
        if (!currencyApiKey) {
            console.warn("Exchange rate API key not found. Using default rates.");
            currencyApiError = true;
        } else {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${currencyApiKey}/latest/USD`);
            const data = await response.json();
            if (data.result === 'success') {
                // Only update currency rates, leave metal rates to be calculated
                finalRates = { ...finalRates, ...data.conversion_rates };
            } else {
                console.error("Failed to fetch latest exchange rates. Using default rates.");
                currencyApiError = true;
            }
        }
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        currencyApiError = true;
      }
      
      setCurrencyRates(prev => ({ ...prev, ...finalRates }));

      if (currencyApiError) {
        toast({
            title: "Live Currency Rate Error",
            description: "Could not fetch live currency rates. Using default values.",
            variant: "destructive"
        });
      }
    };
    fetchCurrencyRates();
  }, [toast]);

  // Combined rates object derived from currency rates and manual metal prices
  const combinedRates = useMemo(() => {
    return {
      ...currencyRates,
      GOLD_GRAM: goldPricePerOunce / GRAMS_PER_TROY_OUNCE,
      SILVER_GRAM: silverPricePerKg / GRAMS_PER_KILOGRAM,
    }
  }, [currencyRates, goldPricePerOunce, silverPricePerKg]);


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
    silverPricePerKg,
    setSilverPricePerKg,
  }), [currency, combinedRates, format, goldPricePerOunce, silverPricePerKg]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
