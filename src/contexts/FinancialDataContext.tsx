// Final V3 Fix - Initialized Check
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { FinancialData } from "@/lib/types";
import { calculateMetrics } from "@/lib/calculations";
import { fetchLiveRates, initialRates, MarketRates } from "@/lib/marketPrices";

// Safe Default (Empty)
const SAFE_DEFAULT_DATA: FinancialData = {
  assets: {
    realEstate: [],
    underDevelopment: [],
    cash: [],
    gold: [],
    silver: [],
    otherAssets: [],
    salary: { amount: 0, currency: 'USD' }
  },
  liabilities: { loans: [], installments: [] },
  monthlyExpenses: { household: [] }
};

interface FinancialDataContextType {
  data: FinancialData;
  setData: (data: FinancialData) => void;
  metrics: ReturnType<typeof calculateMetrics>;
  loading: boolean;
  currency: string;
  setCurrency: (currency: string) => void;
  rates: MarketRates;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FinancialData>(SAFE_DEFAULT_DATA);
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState<MarketRates>(initialRates);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false); // <--- NEW SAFETY FLAG

  // 1. Load Live Rates
  useEffect(() => {
    async function loadRates() {
      try {
        const liveData = await fetchLiveRates();
        if (liveData && liveData.USD) setRates(liveData);
      } catch (e) { console.warn("Using default rates"); }
      setLoading(false);
    }
    loadRates();
    const interval = setInterval(loadRates, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Load User Data (Run ONCE on mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try to find V3 data
      const savedV3 = localStorage.getItem("wealth_navigator_data_v3");
      
      if (savedV3) {
        try {
          const parsed = JSON.parse(savedV3);
          if (parsed && parsed.assets) setData(parsed);
        } catch (e) { console.error("Error parsing V3 data"); }
      } 
      
      // Mark initialization as complete so we can start saving
      setIsInitialized(true); 
    }
  }, []);

  // 3. Save User Data (Run only after Initialized)
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem("wealth_navigator_data_v3", JSON.stringify(data));
    }
  }, [data, isInitialized]); // <--- Only runs if we are initialized

  // 4. Calculate Metrics
  const metrics = useMemo(() => {
    const safeData = data || SAFE_DEFAULT_DATA;
    return calculateMetrics(safeData, currency, rates);
  }, [data, currency, rates]);

  return (
    <FinancialDataContext.Provider 
      value={{ data, setData, metrics, loading, currency, setCurrency, rates }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error("useFinancialData must be used within a FinancialDataProvider");
  }
  return context;
}