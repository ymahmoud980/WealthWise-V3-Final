import type { FinancialData, Currency } from './types';
import type { ExchangeRates } from './types';

const GRAMS_PER_OUNCE = 31.1035;

/**
 * Converts value to display currency.
 */
export const convert = (
  amount: any,
  from: string,
  to: string,
  rates: any
): number => {
  const safeAmount = Number(amount) || 0;
  if (!rates || typeof rates !== 'object') return 0;
  
  if (from === to) return safeAmount;

  // Metal Conversion
  if (from === 'GOLD_GRAM') {
    const pricePerGram = (rates.Gold || 0) / GRAMS_PER_OUNCE;
    return convert(safeAmount * pricePerGram, 'USD', to, rates);
  }
  if (from === 'SILVER_GRAM') {
    const pricePerGram = (rates.Silver || 0) / GRAMS_PER_OUNCE;
    return convert(safeAmount * pricePerGram, 'USD', to, rates);
  }

  // Currency Conversion
  const fromRate = Number(rates[from]) || 1;
  const toRate = Number(rates[to]) || 1;

  const amountInUSD = safeAmount / fromRate;
  return amountInUSD * toRate;
};

export const calculateMetrics = (data: FinancialData, displayCurrency: Currency, rates: ExchangeRates) => {
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
    const realEstateValue = (assets.realEstate || []).reduce((acc, a) => acc + convert(a.currentValue, a.currency, displayCurrency, rates), 0);
    const underDevelopmentValue = (assets.underDevelopment || []).reduce((acc, a) => acc + convert(a.currentValue, a.currency, displayCurrency, rates), 0);
    const cashValue = (assets.cash || []).reduce((acc, a) => acc + convert(a.amount, a.currency, displayCurrency, rates), 0);
    const goldValue = (assets.gold || []).reduce((acc, a) => acc + convert(a.grams, 'GOLD_GRAM', displayCurrency, rates), 0);
    const silverValue = (assets.silver || []).reduce((acc, a) => acc + convert(a.grams, 'SILVER_GRAM', displayCurrency, rates), 0);
    const otherAssetsValue = (assets.otherAssets || []).reduce((acc, a) => acc + convert(a.value, a.currency, displayCurrency, rates), 0);
    
    const totalAssets = realEstateValue + underDevelopmentValue + cashValue + goldValue + silverValue + otherAssetsValue;

    // --- LIABILITIES ---
    const loansValue = (liabilities.loans || []).reduce((acc, l) => acc + convert(l.remaining, l.currency, displayCurrency, rates), 0);
    const installmentsValue = (liabilities.installments || []).reduce((acc, i) => acc + convert(i.total - i.paid, i.currency, displayCurrency, rates), 0);
    const totalLiabilities = loansValue + installmentsValue;
    
    // --- NET WORTH ---
    const netWorth = totalAssets - totalLiabilities;
    
    // --- CASH FLOW ---
    const salaryIncome = convert(assets.salary.amount, assets.salary.currency, displayCurrency, rates);
    
    const rentIncome = (assets.realEstate || []).reduce((acc, a) => {
        let monthlyRent = convert(a.monthlyRent, a.rentCurrency || a.currency, displayCurrency, rates);
        if (a.rentFrequency === 'quarterly') monthlyRent /= 3;
        else if (a.rentFrequency === 'semi-annual') monthlyRent /= 6;
        else if (a.rentFrequency === 'annual') monthlyRent /= 12;
        return acc + monthlyRent;
    }, 0);

    const totalIncome = salaryIncome + rentIncome;

    const loanExpenses = (liabilities.loans || []).reduce((acc, l) => acc + convert(l.monthlyPayment, l.currency, displayCurrency, rates), 0);
    const householdExpenses = (monthlyExpenses.household || []).reduce((acc, e) => acc + convert(e.amount, e.currency, displayCurrency, rates), 0);
    
    // --- FIX: TRUE ANNUALIZED INSTALLMENT COST ---
    const installmentsAvgExpense = (liabilities.installments || []).reduce((acc, inst) => {
        let annualBurden = 0;
        
        // Method A: Smart Schedule Scan (Most Accurate)
        if (inst.schedule && inst.schedule.length > 0) {
            const today = new Date();
            const nextYear = new Date();
            nextYear.setFullYear(today.getFullYear() + 1);

            // Sum ALL payments (Installment + Maint + Parking) due in next 365 days
            inst.schedule.forEach(item => {
                const itemDate = new Date(item.date);
                if (itemDate >= today && itemDate <= nextYear) {
                    annualBurden += convert(item.amount, inst.currency, displayCurrency, rates);
                }
            });
        } 
        
        // Method B: Fallback if no schedule (Frequency Logic)
        if (annualBurden === 0) {
            const amount = convert(inst.amount, inst.currency, displayCurrency, rates);
            if (inst.frequency === 'Monthly') annualBurden = amount * 12;
            else if (inst.frequency === 'Quarterly') annualBurden = amount * 4;
            else if (inst.frequency === 'Semi-Annual') annualBurden = amount * 2;
            else annualBurden = amount; // Annual
        }

        // Return Monthly Average (Total Next Year / 12)
        return acc + (annualBurden / 12);
    }, 0);

    const totalExpenses = loanExpenses + householdExpenses + installmentsAvgExpense;
    const netCashFlow = totalIncome - totalExpenses;

    return {
      netWorth, totalAssets, totalLiabilities, netCashFlow, totalIncome, totalExpenses,
      assets: { existingRealEstate: realEstateValue, offPlanRealEstate: underDevelopmentValue, cash: cashValue, gold: goldValue, silver: silverValue, other: otherAssetsValue },
      liabilities: { loans: loansValue, installments: installmentsValue },
      income: { salary: salaryIncome, rent: rentIncome },
      expenses: { loans: loanExpenses, household: householdExpenses, installmentsAvg: installmentsAvgExpense },
    };
};