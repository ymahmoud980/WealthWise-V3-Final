"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";

export function useCurrency() {
  const context = useFinancialData();
  
  // Safety: Fallback to USD if context is not ready
  const currency = context?.currency || "USD"; 
  const setCurrency = context?.setCurrency || (() => {});
  const rates = context?.rates || {};
  const loading = context?.loading || false;

  const format = (value: any) => {
    // CRASH PROOFING: Check if value is a valid number
    if (value === null || value === undefined || isNaN(Number(value))) {
        return "0.00";
    }

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
      }).format(Number(value));
    } catch (error) {
      // Fallback if currency code is invalid
      return `$${Number(value).toFixed(0)}`;
    }
  };

  return {
    currency,
    setCurrency,
    rates,
    format,
    loading
  };
}