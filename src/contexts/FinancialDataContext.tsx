
"use client";

import { createContext, useState, useEffect, useContext, useMemo, type ReactNode, useCallback } from 'react';
import type { FinancialData, Installment } from '@/lib/types';
import { initialFinancialData } from '@/lib/data';

interface FinancialDataContextType {
  data: FinancialData;
  setData: (data: FinancialData) => void;
  loading: boolean;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'financialData';
const CORRECTION_FLAG_KEY = 'tycoon-h2222-correction-applied';

// This function performs a one-time correction on the user's saved data.
const applyOneTimeCorrection = (data: FinancialData): FinancialData => {
  try {
    const correctionApplied = localStorage.getItem(CORRECTION_FLAG_KEY);
    if (correctionApplied) {
      return data;
    }

    const installments = data.liabilities.installments;
    const tycoonH2222Index = installments.findIndex(i => i.id === 'i3');

    if (tycoonH2222Index !== -1) {
      // These are the original values for Tycoon H2222
      const originalPaid = 4053961;
      const originalNextDueDate = "2025-09-01";
      
      const currentInstallment = installments[tycoonH2222Index];

      // Only apply correction if it seems to have been accidentally advanced
      if (currentInstallment.paid > originalPaid) {
          currentInstallment.paid = originalPaid;
          currentInstallment.nextDueDate = originalNextDueDate;
          console.log("Applied one-time correction for Tycoon H2222.");
      }
    }
    
    localStorage.setItem(CORRECTION_FLAG_KEY, 'true');
    return data;
    
  } catch (error) {
    console.error("Error applying one-time data correction:", error);
    // Return original data if correction fails
    return data;
  }
};

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<FinancialData>(initialFinancialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      let savedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      if (savedDataString) {
        let savedData = JSON.parse(savedDataString);
        // Apply the targeted correction here
        savedData = applyOneTimeCorrection(savedData);
        setDataState(savedData);
        // Save the corrected data back to local storage immediately
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedData));
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialFinancialData));
        setDataState(initialFinancialData);
      }
    } catch (error) {
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

  const value = useMemo(() => ({
    data,
    setData,
    loading,
  }), [data, loading, setData]);

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
