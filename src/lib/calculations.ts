import type { FinancialData, Currency } from './types';
import type { ExchangeRates } from './types';

// Constants
const GRAMS_PER_OUNCE = 31.1035;

/**
 * Converts value to display currency.
 * Includes SAFETY SHIELDS to prevent crashes if data is missing.
 */
export const convert = (
  amount: number,
  from: string,
  to: string,
  rates: any
): number => {
  // Safety: If rates are missing, return 0
  if (!rates || typeof rates !== 'object') return 0;
  
  // If currencies match, no math needed
  if (from === to) return amount;

  // --- METAL CONVERSION ---
  if (from === 'GOLD_GRAM') {
    const goldPricePerOunce = rates.Gold || 0; 
    const pricePerGram = goldPricePerOunce / GRAMS_PER_OUNCE;
    const valueInUSD = amount * pricePerGram;
    return convert(valueInUSD, 'USD', to, rates);
  }

  if (from === 'SILVER_GRAM') {
    const silverPricePerOunce = rates.Silver || 0;
    const pricePerGram = silverPricePerOunce / GRAMS_PER_OUNCE;
    const valueInUSD = amount * pricePerGram;
    return convert(valueInUSD, 'USD', to, rates);
  }

  // --- STANDARD CURRENCY ---
  // Convert Source -> USD -> Target
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;

  // (Amount / FromRate) * ToRate
  // e.g. (100 EUR / 0.95) * 0.31 KWD
  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
};

/**
 * Metric Calculation
 */
export const calculateMetrics = (data: FinancialData, displayCurrency: Currency, rates: ExchangeRates) => {
    // Safety check
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

    // --- ASSETS ---
    const realEstateValue = (assets.realEstate || []).reduce((acc, asset) => acc + convert(asset.currentValue, asset.currency, displayCurrency, rates), 0);
    const underDevelopmentValue = (assets.underDevelopment || []).reduce((acc, asset) => acc + convert(asset.currentValue, asset.currency, displayCurrency, rates), 0);
    const cashValue = (assets.cash || []).reduce((acc, asset) => acc + convert(asset.amount, asset.currency, displayCurrency, rates), 0);
    const goldValue = (assets.gold || []).reduce((acc, asset) => acc + convert(asset.grams, 'GOLD_GRAM', displayCurrency, rates), 0);
    const silverValue = (assets.silver || []).reduce((acc, asset) => acc + convert(asset.grams, 'SILVER_GRAM', displayCurrency, rates), 0);
    
    // FIX: ADDED OTHER ASSETS CALCULATION
    const otherAssetsValue = (assets.otherAssets || []).reduce((acc, asset) => acc + convert(asset.value, asset.currency, displayCurrency, rates), 0);
    
    // FIX: INCLUDED IN TOTAL SUM
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
        if (asset.rentFrequency === 'semi-annual') monthlyRent = monthlyRent / 6;
        if (asset.rentFrequency === 'quarterly') monthlyRent = monthlyRent / 3;
        if (asset.rentFrequency === 'annual') monthlyRent = monthlyRent / 12;
        return acc + monthlyRent;
    }, 0);

    const totalIncome = salaryIncome + rentIncome;

    const loanExpenses = (liabilities.loans || []).reduce((acc, loan) => acc + convert(loan.monthlyPayment, loan.currency, displayCurrency, rates), 0);
    const householdExpenses = (monthlyExpenses.household || []).reduce((acc, expense) => acc + convert(expense.amount, expense.currency, displayCurrency, rates), 0);
    
    const installmentsAvgExpense = (liabilities.installments || []).reduce((acc, inst) => {
        let monthlyCost = 0;
        const convertedAmount = convert(inst.amount, inst.currency, displayCurrency, rates);
        // Divide next payment by frequency months to get avg monthly cost
        if (inst.frequency === 'Annual') monthlyCost = convertedAmount / 12;
        else if (inst.frequency === 'Semi-Annual') monthlyCost = convertedAmount / 6;
        else if (inst.frequency === 'Quarterly') monthlyCost = convertedAmount / 3;
        else if (inst.frequency === 'Monthly') monthlyCost = convertedAmount;
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
        other: otherAssetsValue, // EXPORTED HERE
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