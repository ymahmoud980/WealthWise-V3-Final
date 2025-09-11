
"use client";

import { createContext, useState, useEffect, useContext, useMemo, type ReactNode } from 'react';
import type { FinancialData } from '@/lib/types';
import { initialFinancialData } from '@/lib/data';

interface FinancialDataContextType {
  data: FinancialData;
  setData: (data: FinancialData) => void;
  loading: boolean;
}

const LOCAL_STORAGE_KEY = 'financialData';

export const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<FinancialData>(initialFinancialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on component mount on the client side.
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        setDataState(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setLoading(false);
  }, []);

  const setData = (newData: FinancialData) => {
    try {
      const json = JSON.stringify(newData);
      localStorage.setItem(LOCAL_STORAGE_KEY, json);
      setDataState(newData);
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  };

  const value = useMemo(() => ({
    data,
    setData,
    loading,
  }), [data, loading]);

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
