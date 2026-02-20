"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { FinancialData } from "@/lib/types";
import { calculateMetrics } from "@/lib/calculations";
import { fetchLiveRates, initialRates, MarketRates } from "@/lib/marketPrices";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const SAFE_DEFAULT_DATA: FinancialData = {
  assets: {
    realEstate: [], underDevelopment: [], cash: [], gold: [], silver: [], otherAssets: [],
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
  syncStatus: "synced" | "saving" | "error";
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [data, _setData] = useState<FinancialData>(SAFE_DEFAULT_DATA);
  const isLocalChange = useRef(false);

  const setData = useCallback((newData: FinancialData | ((prev: FinancialData) => FinancialData)) => {
    isLocalChange.current = true;
    _setData(newData);
  }, []);
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState<MarketRates>(initialRates);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "error">("synced");

  // 1. REAL-TIME CLOUD SYNC
  useEffect(() => {
    if (!authLoading && user) {
      // Connect to YOUR specific document in the Cloud
      const userDocRef = doc(db, "users", user.uid);

      // Listen for changes from the cloud
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          // If data exists, load it
          const cloudData = docSnap.data() as FinancialData;
          _setData({ ...SAFE_DEFAULT_DATA, ...cloudData });
        }
        setIsDataLoaded(true);
      });

      return () => unsubscribe();
    } else if (!authLoading && !user) {
      setIsDataLoaded(true);
    }
  }, [user, authLoading]);

  // 2. CLOUD SAVE (With 1s debounce to save money/writes)
  useEffect(() => {
    if (isDataLoaded && user && isLocalChange.current) {
      setSyncStatus("saving");
      const saveData = async () => {
        try {
          // Save current data to Cloud
          await setDoc(doc(db, "users", user.uid), data, { merge: true });
          isLocalChange.current = false;
          setSyncStatus("synced");
        } catch (e) {
          console.error("Error saving to cloud", e);
          setSyncStatus("error");
        }
      };

      const timer = setTimeout(saveData, 1000);
      return () => clearTimeout(timer);
    }
  }, [data, isDataLoaded, user]);

  // 3. Load Rates
  useEffect(() => {
    async function loadRates() {
      try {
        const liveData = await fetchLiveRates();
        if (liveData && liveData.USD) setRates(liveData);
      } catch (e) { }
    }
    loadRates();
    const interval = setInterval(loadRates, 60000);
    return () => clearInterval(interval);
  }, []);

  // 4. Metrics
  const metrics = useMemo(() => {
    return calculateMetrics(data, currency, rates);
  }, [data, currency, rates]);

  // Loading Screen
  if (authLoading) return <div className="flex h-screen w-full items-center justify-center bg-[#020817] text-white"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!user) return <>{children}</>;
  if (!isDataLoaded) return <div className="flex h-screen w-full items-center justify-center bg-[#020817] text-white"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /><p className="text-sm text-muted-foreground ml-2">Syncing with Cloud...</p></div>;

  return (
    <FinancialDataContext.Provider
      value={{ data, setData, metrics, loading: !isDataLoaded, currency, setCurrency, rates, syncStatus }}
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