"use client";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export function useCurrency() {
  let context;
  try { context = useFinancialData(); } catch(e) {} // Safe access

  const currency = context?.currency || "USD";
  const setCurrency = context?.setCurrency || (() => {});
  const rates = context?.rates || {};
  const loading = context?.loading || false;

  const format = (value: any) => {
    if (value === null || value === undefined || isNaN(Number(value))) return "0.00";
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value));
    } catch { return `${currency} ${Number(value).toFixed(0)}`; }
  };

  return { currency, setCurrency, rates, format, loading };
}