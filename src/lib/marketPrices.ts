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

// 1. UPDATED DEFAULTS (Jan 2026 Reality)
export const initialRates: MarketRates = {
  USD: 1,
  EUR: 0.863,
  GBP: 0.79,
  Gold: 5100.00,  // Updated per your request
  Silver: 109.00, // Updated per your request
  TRY: 45.0,
  EGP: 65.0,
  KWD: 0.31
};

export async function fetchLiveRates(): Promise<MarketRates> {
  try {
    // 2. Dual-Source Fetch
    const [currencyRes, metalRes] = await Promise.all([
      fetch(`https://api.exchangerate-api.com/v4/latest/USD?t=${Date.now()}`),
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,kinesis-silver&vs_currencies=usd&t=${Date.now()}`)
    ]);

    const currencyData = await currencyRes.json();
    const metalData = await metalRes.json();

    const rates = currencyData.rates || {};
    
    // Check if CoinGecko returned data. If not, keep our new high defaults.
    const realGold = metalData["pax-gold"]?.usd || initialRates.Gold;
    const realSilver = metalData["kinesis-silver"]?.usd || initialRates.Silver;

    return {
      ...initialRates, 
      ...rates,
      Gold: realGold,  
      Silver: realSilver
    };

  } catch (error) {
    console.warn("Market API Error, using updated fallbacks.");
    return initialRates;
  }
}