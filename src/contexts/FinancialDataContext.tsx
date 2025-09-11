
"use client";

import { createContext, useState, useEffect, useContext, useMemo, type ReactNode } from 'react';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import type { FinancialData } from '@/lib/types';
import { initialFinancialData } from '@/lib/data';
import { app } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

interface FinancialDataContextType {
  data: FinancialData;
  setData: (data: FinancialData) => void;
  loading: boolean;
}

export const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [data, setDataState] = useState<FinancialData>(initialFinancialData);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const db = getFirestore(app);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
      setDataState(initialFinancialData);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const dbData = docSnap.data() as FinancialData;
        if (!isSaving) { // Prevent overwriting local state while a save is in progress
          setDataState(dbData);
        }
      } else {
        // If no document exists, create one with the initial data
        setDoc(docRef, initialFinancialData).then(() => {
          setDataState(initialFinancialData);
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching data from Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, db]);

  const setData = async (newData: FinancialData) => {
    setDataState(newData); // Optimistic update
    if (user) {
      setIsSaving(true);
      const docRef = doc(db, 'users', user.uid);
      try {
        await setDoc(docRef, newData, { merge: true });
      } catch (error) {
        console.error("Error saving data to Firestore:", error);
        // Optionally, revert the optimistic update here or show a toast
      } finally {
        setIsSaving(false);
      }
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
