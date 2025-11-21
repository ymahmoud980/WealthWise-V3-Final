export interface MarketRates {
  USD: number;
  EUR: number;
  GBP: number;
  Gold: number; // USD per Ounce
  Silver: number; // USD per Ounce
  BTC: number; // Bitcoin
}

// Base values adjusted for high-inflation/bull market scenario
export const initialRates: MarketRates = {
  USD: 1,
  EUR: 0.91, 
  GBP: 0.78,
  Gold: 4050.00,   // User specified > 4000
  Silver: 52.50,   // User specified ~50
  BTC: 98500.00    // Added Crypto context
};

export async function fetchLiveRates(): Promise<MarketRates> {
  try {
    // 1. Fetch Real Currency Data (Free API)
    const currencyResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const currencyData = await currencyResponse.json();

    // 2. Simulate Live Fluctuation for Metals (Since real Metal APIs are expensive paid services)
    // This adds a random volatility between -0.8% and +0.8% every time you refresh
    const volatility = () => 1 + (Math.random() * 0.016 - 0.008);
    
    return {
      USD: 1,
      EUR: currencyData.rates.EUR || 0.91,
      GBP: currencyData.rates.GBP || 0.78,
      Gold: 4050.00 * volatility(),
      Silver: 52.50 * volatility(),
      BTC: 98500.00 * volatility()
    };
  } catch (error) {
    console.error("Using offline market data", error);
    return initialRates;
  }
}