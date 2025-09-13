
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
const CORRECTION_FLAG_KEY = 'nurai-i5-sept-2025-correction-final';

// This function performs a one-time correction on the user's saved data.
const applyOneTimeCorrection = (data: FinancialData): FinancialData => {
  try {
    const correctionApplied = localStorage.getItem(CORRECTION_FLAG_KEY);
    if (correctionApplied) {
      return data;
    }

    const correctedData = JSON.parse(JSON.stringify(data)); // Deep copy
    const installments = correctedData.liabilities.installments as Installment[];
    const nuraiIndex = installments.findIndex(i => i.id === 'i5');

    if (nuraiIndex !== -1) {
        const currentInstallment = installments[nuraiIndex];
        
        // This state represents that the installment due on Sept 25, 2025 is the next one to be paid.
        const correctPaidAmount = 546047;
        const correctNextDueDate = "2025-09-25";

        currentInstallment.paid = correctPaidAmount;
        currentInstallment.nextDueDate = correctNextDueDate;
        console.log(`Applied one-time correction for Nurai (i5) to set paid amount to ${correctPaidAmount} and next due date to ${correctNextDueDate}.`);
    }
    
    localStorage.setItem(CORRECTION_FLAG_KEY, 'true');
    return correctedData;
    
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
        
        // **Resetting the history as requested**
        savedData.history = [];

        setDataState(savedData);
        // Save the corrected data back to local storage immediately
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedData));
      } else {
        const initialDataWithEmptyHistory = { ...initialFinancialData, history: [] };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialDataWithEmptyHistory));
        setDataState(initialDataWithEmptyHistory);
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
