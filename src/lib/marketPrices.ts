// src/lib/marketPrices.ts

export interface MarketRates {
  USD: number;
  EUR: number;
  GBP: number;
  Gold: number;
  Silver: number;
  TRY: number;
  EGP: number;
  KWD: number;
  [key: string]: number;
}

// 1. Base Fallback (Nov 2025)
// These are only used if the API fails or doesn't provide Metal data
export const initialRates: MarketRates = {
  USD: 1,
  EUR: 0.95,
  GBP: 0.82,
  Gold: 4121.05, 
  Silver: 50.50,
  TRY: 45.0,
  EGP: 65.0,
  KWD: 0.31
};

export async function fetchLiveRates(): Promise<MarketRates> {
  try {
    // 2. Fetch Real Data
    // We add a timestamp (?t=...) to ensure the browser doesn't show you old cached data
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/USD?t=${new Date().getTime()}`);
    
    if (!res.ok) throw new Error("API Failed");
    
    const data = await res.json();
    const rates = data.rates;

    // 3. Calculate Real Prices (No Simulation)
    // If API gives Gold (XAU), calculate price. If not, keep fallback.
    const realGold = rates.XAU ? (1 / rates.XAU) : initialRates.Gold;
    const realSilver = rates.XAG ? (1 / rates.XAG) : initialRates.Silver;

    return {
      ...initialRates, // Keep defaults for missing currencies
      ...rates,        // Overwrite with live API data
      Gold: realGold,  
      Silver: realSilver
    };

  } catch (error) {
    console.warn("Market Data Offline: Using backup rates.");
    return initialRates;
  }
}