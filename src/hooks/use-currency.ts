"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";

export function useCurrency() {
  // We now pull the state directly from the main Financial Context.
  // This ensures that when you switch currency here, the WHOLE app updates.
  const { currency, setCurrency, rates, loading } = useFinancialData();

  const format = (value: number) => {
    // Handle invalid numbers safely
    if (isNaN(value) || value === null || value === undefined) {
        return "0.00";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0, // Keeps the UI clean (no cents)
    }).format(value);
  };

  return {
    currency,
    setCurrency,
    rates,
    format,
    loading
  };
}