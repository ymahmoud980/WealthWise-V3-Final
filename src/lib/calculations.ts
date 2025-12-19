import type { FinancialData, Currency } from './types';
import type { ExchangeRates } from './types';

// Constants
const GRAMS_PER_OUNCE = 31.1035;

/**
 * STRICT CONVERSION FUNCTION
 * Forces all inputs to be numbers. Never returns NaN.
 */
export const convert = (
  amount: any, // Accept any to handle strings/numbers safely
  from: string,
  to: string,
  rates: any
): number => {
  // 1. Sanitize Input: Force to Number, default to 0 if invalid
  const safeAmount = Number(amount);
  if (isNaN(safeAmount) || !isFinite(safeAmount)) return 0;

  // 2. Safety Shield for Rates
  if (!rates || typeof rates !== 'object') return 0;

  // 3. Optimization: Same Currency
  if (from === to) return safeAmount;

  // 4. Precious Metals Logic
  if (from === 'GOLD_GRAM') {
    const goldPricePerOunce = Number(rates.Gold) || 0; 
    const pricePerGram = goldPricePerOunce / GRAMS_PER_OUNCE;
    const valueInUSD = safeAmount * pricePerGram;
    return convert(valueInUSD, 'USD', to, rates);
  }

  if (from === 'SILVER_GRAM') {
    const silverPricePerOunce = Number(rates.Silver) || 0;
    const pricePerGram = silverPricePerOunce / GRAMS_PER_OUNCE;
    const valueInUSD = safeAmount * pricePerGram;
    return convert(valueInUSD, 'USD', to, rates);
  }

  // 5. Standard Currency Logic (Base is USD)
  const fromRate = Number(rates[from]) || 1;
  const toRate = Number(rates[to]) || 1;

  // Calculation: (Amount / FromRate) * ToRate
  // We use USD as the middleman
  const amountInUSD = safeAmount / fromRate;
  return amountInUSD * toRate;
};

/**
 * STRICT METRICS CALCULATION
 * Ensures sums never break due to a single bad value.
 */
export const calculateMetrics = (data: FinancialData, displayCurrency: Currency, rates: ExchangeRates) => {
    // Safety check for empty data
    if (!data || !data.assets) {
       return {
          netWorth: 0, totalAssets: 0, totalLiabilities: 0, netCashFlow: 0,
          totalIncome: 0, totalExpenses: 0,
          assets: { existingRealEstate: 0, offPlanRealEstate: 0, cash: 0, gold: 0, silver: 0, other: 0 },
          liabilities: { loans: 0, installments: 0 },
          income: { salary: 0, rent: 0 },
          expenses: { loans: 0, household: 0, installmentsAvg: 0 }
       };
    }

    const { assets, liabilities, monthlyExpenses } = data;

    // --- ASSETS (Strict Addition) ---
    const realEstateValue = (assets.realEstate || []).reduce((acc, asset) => acc + convert(asset.currentValue, asset.currency, displayCurrency, rates), 0);
    const underDevelopmentValue = (assets.underDevelopment || []).reduce((acc, asset) => acc + convert(asset.currentValue, asset.currency, displayCurrency, rates), 0);
    const cashValue = (assets.cash || []).reduce((acc, asset) => acc + convert(asset.amount, asset.currency, displayCurrency, rates), 0);
    const goldValue = (assets.gold || []).reduce((acc, asset) => acc + convert(asset.grams, 'GOLD_GRAM', displayCurrency, rates), 0);
    const silverValue = (assets.silver || []).reduce((acc, asset) => acc + convert(asset.grams, 'SILVER_GRAM', displayCurrency, rates), 0);
    const otherAssetsValue = (assets.otherAssets || []).reduce((acc, asset) => acc + convert(asset.value, asset.currency, displayCurrency, rates), 0);
    
    const totalAssets = realEstateValue + underDevelopmentValue + cashValue + goldValue + silverValue + otherAssetsValue;

    // --- LIABILITIES (Strict Addition) ---
    const loansValue = (liabilities.loans || []).reduce((acc, loan) => acc + convert(loan.remaining, loan.currency, displayCurrency, rates), 0);
    
    const installmentsValue = (liabilities.installments || []).reduce((acc, inst) => {
        // Calculate remaining: (Total - Paid)
        // Force numbers to prevent string subtraction errors
        const total = Number(inst.total) || 0;
        const paid = Number(inst.paid) || 0;
        const remaining = Math.max(0, total - paid); // Prevent negative debt
        return acc + convert(remaining, inst.currency, displayCurrency, rates);
    }, 0);

    const totalLiabilities = loansValue + installmentsValue;
    
    // --- NET WORTH ---
    const netWorth = totalAssets - totalLiabilities;
    
    // --- CASH FLOW (Strict Addition) ---
    const salaryIncome = convert(assets.salary.amount, assets.salary.currency, displayCurrency, rates);
    
    const rentIncome = (assets.realEstate || []).reduce((acc, asset) => {
        let monthlyRent = convert(asset.monthlyRent, asset.rentCurrency || asset.currency, displayCurrency, rates);
        if (asset.rentFrequency === 'semi-annual') {
            monthlyRent = monthlyRent / 6;
        } else if (asset.rentFrequency === 'annual') { // Added Annual support
            monthlyRent = monthlyRent / 12;
        } else if (asset.rentFrequency === 'quarterly') {
            monthlyRent = monthlyRent / 3;
        }
        return acc + monthlyRent;
    }, 0);

    const totalIncome = salaryIncome + rentIncome;

    const loanExpenses = (liabilities.loans || []).reduce((acc, loan) => acc + convert(loan.monthlyPayment, loan.currency, displayCurrency, rates), 0);
    const householdExpenses = (monthlyExpenses.household || []).reduce((acc, expense) => acc + convert(expense.amount, expense.currency, displayCurrency, rates), 0);
    
    const installmentsAvgExpense = (liabilities.installments || []).reduce((acc, inst) => {
        // Calculate Monthly Load
        const amount = Number(inst.amount) || 0;
        let monthlyCost = 0;
        const convertedAmount = convert(amount, inst.currency, displayCurrency, rates);
        
        if (inst.frequency === 'Annual') monthlyCost = convertedAmount / 12;
        else if (inst.frequency === 'Semi-Annual') monthlyCost = convertedAmount / 6;
        else if (inst.frequency === 'Quarterly') monthlyCost = convertedAmount / 3;
        else monthlyCost = convertedAmount; // Monthly
        
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