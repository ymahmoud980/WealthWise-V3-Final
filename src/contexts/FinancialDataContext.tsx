
"use client";

import { createContext, useState, useMemo, type ReactNode, useContext } from 'react';
import type { FinancialData } from '@/lib/types';
import { initialFinancialData } from '@/lib/data';

interface FinancialDataContextType {
  data: FinancialData;
  setData: (data: FinancialData) => void;
}

export const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinancialData>(initialFinancialData);

  const value = useMemo(() => ({
    data,
    setData,
  }), [data]);

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
