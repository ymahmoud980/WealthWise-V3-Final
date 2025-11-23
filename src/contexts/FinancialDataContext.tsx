"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { FinancialData } from "@/lib/types";
import { defaultFinancialData, emptyFinancialData } from "@/lib/data";
import { calculateMetrics } from "@/lib/calculations";
import { fetchLiveRates, initialRates, MarketRates } from "@/lib/marketPrices";

// Define the Context Shape
interface FinancialDataContextType {
  data: FinancialData;
  setData: (data: FinancialData) => void;
  metrics: ReturnType<typeof calculateMetrics>;
  loading: boolean;
  // We add Currency controls directly here to ensure sync
  currency: string;
  setCurrency: (currency: string) => void;
  rates: MarketRates;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: React.ReactNode }) {
  // 1. App State
  const [data, setData] = useState<FinancialData>(defaultFinancialData);
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState<MarketRates>(initialRates);
  const [loading, setLoading] = useState(true);

  // 2. Fetch Live Rates on Mount
  useEffect(() => {
    async function loadRates() {
      try {
        const liveData = await fetchLiveRates();
        setRates(liveData);
      } catch (e) {
        console.error("Failed to load rates, using defaults");
      } finally {
        setLoading(false);
      }
    }
    loadRates();
    
    // Optional: Refresh rates every 60 seconds
    const interval = setInterval(loadRates, 60000);
    return () => clearInterval(interval);
  }, []);

  // 3. Load Data from LocalStorage on Mount
  useEffect(() => {
    const saved = localStorage.getItem("wealth_navigator_data_v3");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data");
      }
    }
  }, []);

  // 4. Save Data to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wealth_navigator_data_v3", JSON.stringify(data));
  }, [data]);

  // 5. REACTIVE CALCULATION (The Fix)
  // This recalculates metrics AUTOMATICALLY whenever Data, Currency, OR Rates change.
  const metrics = useMemo(() => {
    return calculateMetrics(data, currency, rates);
  }, [data, currency, rates]);

  return (
    <FinancialDataContext.Provider 
      value={{ 
        data, 
        setData, 
        metrics, 
        loading,
        currency,
        setCurrency,
        rates 
      }}
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