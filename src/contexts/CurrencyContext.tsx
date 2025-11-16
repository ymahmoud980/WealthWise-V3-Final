
"use client";

import { createContext, useState, useMemo, type ReactNode, useEffect } from 'react';
import type { Currency, ExchangeRates } from '@/lib/types';
import { rates as defaultRates } from '@/lib/calculations';
import { useToast } from '@/hooks/use-toast';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: ExchangeRates;
  format: (value: number) => string;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [rates, setRates] = useState<ExchangeRates>(defaultRates);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRates = async () => {
      let finalRates = { ...defaultRates };
      let currencyApiError = false;
      let goldApiError = false;
      
      // Fetch currency rates
      try {
        const currencyApiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
        if (!currencyApiKey) {
            console.warn("Exchange rate API key not found. Using default rates.");
            currencyApiError = true;
        } else {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${currencyApiKey}/latest/USD`);
            const data = await response.json();
            if (data.result === 'success') {
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

      // Fetch Gold and Silver prices from a public API
      try {
        const metalResponse = await fetch(`https://www.goldapi.io/api/XAU/USD`);
        const goldData = await metalResponse.json();
        if (goldData && goldData.price) {
            finalRates['GOLD_GRAM'] = goldData.price_gram_24k;
        } else {
            goldApiError = true;
        }

        const silverResponse = await fetch(`https://www.goldapi.io/api/XAG/USD`);
        const silverData = await silverResponse.json();
        if (silverData && silverData.price) {
            finalRates['SILVER_GRAM'] = silverData.price_gram_24k;
        } else {
            goldApiError = true;
        }
      } catch (error) {
          console.error("Error fetching precious metal prices:", error);
          goldApiError = true;
      }
      
      setRates(finalRates);

      if (currencyApiError) {
        toast({
            title: "Live Currency Rate Error",
            description: "Could not fetch live currency rates. Using default values.",
            variant: "destructive"
        });
      }
      if (goldApiError) {
         toast({
            title: "Live Metal Price Error",
            description: "Could not fetch live gold/silver prices. Using fallback values.",
            variant: "destructive"
        });
      }

    };
    fetchRates();
  }, [toast]);


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
    rates,
    format,
  }), [currency, rates, format]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
