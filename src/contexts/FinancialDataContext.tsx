
"use client";

import { createContext, useState, useEffect, useContext, useMemo, type ReactNode, useCallback } from 'react';
import type { FinancialData, Loan } from '@/lib/types';
import { initialFinancialData } from '@/lib/data';
import { calculateMetrics } from '@/lib/calculations';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { differenceInMonths, parseISO, startOfMonth } from 'date-fns';


interface FinancialDataContextType {
  data: FinancialData;
  setData: (data: FinancialData) => void;
  loading: boolean;
  metrics: ReturnType<typeof calculateMetrics>;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setDataState] = useState<FinancialData>(initialFinancialData);
  const [loading, setLoading] = useState(true);
  const { currency, rates } = useCurrency();

  const handleAutomaticLoanUpdates = useCallback((currentData: FinancialData): FinancialData => {
    const lastUpdated = currentData.lastUpdated ? parseISO(currentData.lastUpdated) : new Date(2020, 0, 1);
    const today = new Date();
    const startOfThisMonth = startOfMonth(today);
    
    // Only run updates on or after the 1st of the month if the last update was before this month.
    if (lastUpdated >= startOfThisMonth) {
        return currentData;
    }

    const monthsPassed = differenceInMonths(startOfThisMonth, lastUpdated);

    if (monthsPassed <= 0) {
      return currentData;
    }

    let needsUpdate = false;
    const updatedLoans = currentData.liabilities.loans.map((loan: Loan) => {
      let newRemaining = loan.remaining;
      for (let i = 0; i < monthsPassed; i++) {
        if (newRemaining > 0) {
          newRemaining -= loan.monthlyPayment;
          needsUpdate = true;
        }
      }
      return {
        ...loan,
        remaining: Math.max(0, newRemaining), // Ensure remaining doesn't go below zero
      };
    });

    if (needsUpdate) {
        return {
            ...currentData,
            liabilities: {
                ...currentData.liabilities,
                loans: updatedLoans,
            },
            lastUpdated: today.toISOString(),
        };
    }

    return currentData;
  }, []);


  const fetchData = useCallback(async () => {
    if (!user) {
        setLoading(false);
        return;
    }
    setLoading(true);
    const userDocRef = doc(db, 'userFinancialData', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const fetchedData = docSnap.data() as FinancialData;
      const updatedData = handleAutomaticLoanUpdates(fetchedData);
      setDataState(updatedData);
      // If an update happened, save it back to Firestore
      if (JSON.stringify(updatedData) !== JSON.stringify(fetchedData)) {
          await setDoc(userDocRef, updatedData, { merge: true });
      }
    } else {
      // If no data, set initial data for the new user, applying updates if necessary
      const updatedData = handleAutomaticLoanUpdates(initialFinancialData);
      await setDoc(userDocRef, updatedData);
      setDataState(updatedData);
    }
    setLoading(false);
  }, [user, handleAutomaticLoanUpdates]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setData = useCallback(async (newData: FinancialData) => {
    setDataState(newData);
    if (user) {
      try {
        const userDocRef = doc(db, 'userFinancialData', user.uid);
        // Ensure lastUpdated is always set on manual saves
        const dataToSave = { ...newData, lastUpdated: new Date().toISOString() };
        await setDoc(userDocRef, dataToSave, { merge: true });
      } catch (error) {
        console.error("Failed to save data to Firestore:", error);
      }
    }
  }, [user]);

  const metrics = useMemo(() => calculateMetrics(data, currency, rates), [data, currency, rates]);

  const value = useMemo(() => ({
    data,
    setData,
    loading: loading || !user,
    metrics,
  }), [data, setData, loading, user, metrics]);

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
