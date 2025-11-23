import type { FinancialData, Currency } from './types';
import type { ExchangeRates } from './types';

// Constants for Precious Metals Math
const GRAMS_PER_OUNCE = 31.1035;

/**
 * Converts any asset value to the display currency.
 * INTELLIGENTLY HANDLES LIVE GOLD/SILVER PRICES.
 */
export const convert = (
  amount: number,
  from: string, // Using string to allow special keys like 'GOLD_GRAM'
  to: string,
  rates: any // Using 'any' to ensure we can read .Gold/.Silver from live data
): number => {
  if (from === to) {
    return amount;
  }

  // --- 1. SPECIAL LOGIC FOR LIVE METALS ---
  // Your Live Market Ticker gives prices in $/Ounce (USD).
  // Your Assets are stored in Grams.
  // We must convert Grams -> Ounces -> USD first.

  if (from === 'GOLD_GRAM') {
    // Grab live price from the ticker data, or 0 if missing
    const goldPricePerOunce = rates.Gold || 0; 
    
    // Math: (Price/Oz) / 31.1035 = Price/Gram
    const pricePerGram = goldPricePerOunce / GRAMS_PER_OUNCE;
    
    // Value in USD = Grams Owned * Price Per Gram
    const valueInUSD = amount * pricePerGram;
    
    // Finally, convert that USD value to your display currency (e.g., EUR)
    return convert(valueInUSD, 'USD', to, rates);
  }

  if (from === 'SILVER_GRAM') {
    const silverPricePerOunce = rates.Silver || 0;
    const pricePerGram = silverPricePerOunce / GRAMS_PER_OUNCE;
    const valueInUSD = amount * pricePerGram;
    return convert(valueInUSD, 'USD', to, rates);
  }

  // --- 2. STANDARD CURRENCY LOGIC ---
  // (Base currency is always USD in this system)

  // Step A: Convert from Source to USD
  // Example: You have 100 EUR. Rate is 0.92. 
  // 100 EUR / 0.92 = 108.69 USD
  const fromRate = rates[from] || 1;
  const amountInUSD = amount / fromRate;

  // Step B: Convert USD to Target
  // Example: Convert that USD to GBP (Rate 0.79)
  // 108.69 USD * 0.79 = 85.86 GBP
  const toRate = rates[to] || 1;

  return amountInUSD * toRate;
};


/**
 * Aggregates all data into the metrics used by the Dashboard.
 * (This part was perfect in your previous file, keeping it exactly as is)
 */
export const calculateMetrics = (data: FinancialData, displayCurrency: Currency, rates: ExchangeRates) => {
    const { assets, liabilities, monthlyExpenses } = data;

    // --- ASSETS ---
    const realEstateValue = (assets.realEstate || []).reduce((acc, asset) => acc + convert(asset.currentValue, asset.currency, displayCurrency, rates), 0);
    const underDevelopmentValue = (assets.underDevelopment || []).reduce((acc, asset) => acc + convert(asset.currentValue, asset.currency, displayCurrency, rates), 0);
    const cashValue = (assets.cash || []).reduce((acc, asset) => acc + convert(asset.amount, asset.currency, displayCurrency, rates), 0);
    const goldValue = (assets.gold || []).reduce((acc, asset) => acc + convert(asset.grams, 'GOLD_GRAM', displayCurrency, rates), 0);
    const silverValue = (assets.silver || []).reduce((acc, asset) => acc + convert(asset.grams, 'SILVER_GRAM', displayCurrency, rates), 0);
    const otherAssetsValue = (assets.otherAssets || []).reduce((acc, asset) => acc + convert(asset.value, asset.currency, displayCurrency, rates), 0);
    
    const totalAssets = realEstateValue + underDevelopmentValue + cashValue + goldValue + silverValue + otherAssetsValue;

    // --- LIABILITIES ---
    const loansValue = (liabilities.loans || []).reduce((acc, loan) => acc + convert(loan.remaining, loan.currency, displayCurrency, rates), 0);
    const installmentsValue = (liabilities.installments || []).reduce((acc, inst) => acc + convert(inst.total - inst.paid, inst.currency, displayCurrency, rates), 0);
    const totalLiabilities = loansValue + installmentsValue;
    
    // --- NET WORTH ---
    const netWorth = totalAssets - totalLiabilities;
    
    // --- CASH FLOW ---
    const salaryIncome = convert(assets.salary.amount, assets.salary.currency, displayCurrency, rates);
    
    const rentIncome = (assets.realEstate || []).reduce((acc, asset) => {
        let monthlyRent = convert(asset.monthlyRent, asset.rentCurrency || asset.currency, displayCurrency, rates);
        if (asset.rentFrequency === 'semi-annual') {
            monthlyRent = monthlyRent / 6;
        }
        return acc + monthlyRent;
    }, 0);

    const totalIncome = salaryIncome + rentIncome;

    const loanExpenses = (liabilities.loans || []).reduce((acc, loan) => acc + convert(loan.monthlyPayment, loan.currency, displayCurrency, rates), 0);
    const householdExpenses = (monthlyExpenses.household || []).reduce((acc, expense) => acc + convert(expense.amount, expense.currency, displayCurrency, rates), 0);
    
    const installmentsAvgExpense = (liabilities.installments || []).reduce((acc, inst) => {
        let monthlyCost = 0;
        const convertedAmount = convert(inst.amount, inst.currency, displayCurrency, rates);
        if (inst.frequency === 'Annual') monthlyCost = convertedAmount / 12;
        else if (inst.frequency === 'Semi-Annual') monthlyCost = convertedAmount / 6;
        else if (inst.frequency === 'Quarterly') monthlyCost = convertedAmount / 3;
        return acc + monthlyCost;
    }, 0);

    const totalExpenses = loanExpenses + householdExpenses + installmentsAvgExpense;
    
    const netCashFlow = totalIncome - totalExpenses;

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      netCashFlow,
      totalIncome,
      totalExpenses,
      assets: {
        existingRealEstate: realEstateValue,
        offPlanRealEstate: underDevelopmentValue,
        cash: cashValue,
        gold: goldValue,
        silver: silverValue,
        other: otherAssetsValue,
      },
      liabilities: {
        loans: loansValue,
        installments: installmentsValue,
      },
      income: {
        salary: salaryIncome,
        rent: rentIncome,
      },
      expenses: {
        loans: loanExpenses,
        household: householdExpenses,
        installmentsAvg: installmentsAvgExpense,
      },
    };
};