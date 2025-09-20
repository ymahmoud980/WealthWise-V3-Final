
"use client";

import { createContext, useState, useEffect, useContext, useMemo, type ReactNode, useCallback } from 'react';
import type { FinancialData } from '@/lib/types';
import { initialFinancialData } from '@/lib/data';
import { calculateMetrics } from '@/lib/calculations';
import { useCurrency } from '@/hooks/use-currency';
import { getFinancialDataFromFirestore, saveFinancialDataToFirestore } from '@/lib/firebase';
import { useAuth } from './AuthContext';

interface FinancialDataContextType {
  data: FinancialData;
  setData: (data: FinancialData) => void;
  loading: boolean;
  metrics: ReturnType<typeof calculateMetrics>;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<FinancialData>(initialFinancialData);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        setDataState(initialFinancialData); // Reset to initial if user logs out
        return;
      };

      setLoading(true);
      try {
        let firestoreData = await getFinancialDataFromFirestore(user.uid);
        
        if (firestoreData) {
          setDataState(firestoreData);
        } else {
          // No saved data for this user, use the initial default data and save it.
          await saveFinancialDataToFirestore(user.uid, initialFinancialData);
          setDataState(initialFinancialData);
        }
      } catch (error) {
        console.error("Error reading from Firestore:", error);
        // Fallback to initial data if Firestore fails
        setDataState(initialFinancialData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const setData = useCallback((newData: FinancialData) => {
    if (!user) return;
    try {
      const updatedData = { ...newData, lastUpdated: new Date().toISOString() };
      setDataState(updatedData);
      saveFinancialDataToFirestore(user.uid, updatedData);
    } catch (error) {
      console.error("Failed to save data to Firestore:", error);
    }
  }, [user]);

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
