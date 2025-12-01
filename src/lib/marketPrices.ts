// src/lib/marketPrices.ts

export interface MarketRates {
  USD: number;
  EUR: number;
  GBP: number;
  Gold: number;   // Price per Ounce in USD
  Silver: number; // Price per Ounce in USD
  TRY: number;
  EGP: number;
  KWD: number;
  [key: string]: number;
}

// 1. Updated Defaults (Matches your Nov 2025 Screenshot)
// If the API fails or is slow, the app will show THESE numbers instead of old ones.
export const initialRates: MarketRates = {
  USD: 1,
  EUR: 0.863,
  GBP: 0.79,
  Gold: 4153.43, 
  Silver: 54.18,
  TRY: 45.0,
  EGP: 65.0,
  KWD: 0.31
};

export async function fetchLiveRates(): Promise<MarketRates> {
  try {
    // 2. Fetch Data from TWO sources in parallel
    // Source A: ExchangeRate-API (Currencies)
    // Source B: CoinGecko (Live Metals: PAX Gold & Kinesis Silver)
    const [currencyRes, metalRes] = await Promise.all([
      fetch(`https://api.exchangerate-api.com/v4/latest/USD?t=${Date.now()}`),
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,kinesis-silver&vs_currencies=usd&t=${Date.now()}`)
    ]);

    const currencyData = await currencyRes.json();
    const metalData = await metalRes.json();

    // 3. Process Data
    const rates = currencyData.rates || {};

    // Get Metal Prices (Check if CoinGecko returned data, otherwise use Fallback)
    const realGold = metalData["pax-gold"]?.usd || initialRates.Gold;
    const realSilver = metalData["kinesis-silver"]?.usd || initialRates.Silver;

    return {
      ...initialRates, // Safety defaults for missing currencies
      ...rates,        // Overwrite with live currency rates
      
      // Live Metal Prices
      Gold: realGold,  
      Silver: realSilver
    };

  } catch (error) {
    console.warn("Market API Error, using fallbacks:", error);
    return initialRates;
  }
}