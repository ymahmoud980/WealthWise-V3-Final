
"use client";

import { createContext, useState, useEffect, useContext, useMemo, type ReactNode, useCallback } from 'react';
import type { FinancialData } from '@/lib/types';
import { initialFinancialData } from '@/lib/data';
import { calculateMetrics } from '@/lib/calculations';
import { useCurrency } from '@/hooks/use-currency';

interface FinancialDataContextType {
  data: FinancialData;
  setData: (data: FinancialData) => void;
  loading: boolean;
  metrics: ReturnType<typeof calculateMetrics>;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'financialData';

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<FinancialData>(initialFinancialData);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency(); // Get the currency to calculate metrics

  useEffect(() => {
    setLoading(true);
    try {
      let savedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      if (savedDataString) {
        let savedData = JSON.parse(savedDataString);
        
        // Force update if the default data file has a newer timestamp
        const savedDate = savedData.lastUpdated ? new Date(savedData.lastUpdated) : new Date(0);
        const initialDate = initialFinancialData.lastUpdated ? new Date(initialFinancialData.lastUpdated) : new Date();

        if (initialDate > savedDate) {
          // The default data is newer, so we should use it.
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialFinancialData));
          setDataState(initialFinancialData);
        } else {
          // The saved data is up-to-date or newer.
          setDataState(savedData);
        }
      } else {
        // No saved data, use the initial default data.
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialFinancialData));
        setDataState(initialFinancialData);
      }
    } catch (error)
     {
      console.error("Error reading from localStorage:", error);
      setDataState(initialFinancialData);
    } finally {
      setLoading(false);
    }
  }, []);

  const setData = useCallback((newData: FinancialData) => {
    try {
      const updatedData = { ...newData, lastUpdated: new Date().toISOString() };
      setDataState(updatedData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
    }
  }, []);

  // Memoize the metrics calculation
  const metrics = useMemo(() => calculateMetrics(data, currency), [data, currency]);

  const value = useMemo(() => ({
    data,
    setData,
    loading,
    metrics,
  }), [data, loading, setData, metrics]);

  return (
    <FinancialDataContext.Provider value={value}>
      {children}
    </FinancialDataContext.Provider>
  );
}

export const useFinancialData = () => {
    const context = useContext(FinancialDataContext);
    if (context === undefined) {
        throw new Error('useFinancialData must be used within a FinancialDataProvider');
    }
    return context;
};
