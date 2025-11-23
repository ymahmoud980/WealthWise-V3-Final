import type { FinancialData, Currency } from './types';
import type { ExchangeRates } from './types';

// Helper function to convert any value to the chosen display currency
export const convert = (
  amount: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates
): number => {
  if (from === to) {
    return amount;
  }

  // First, convert from the source currency to the base currency (USD)
  const amountInUSD = amount / (rates[from] || 1);

  // Then, convert from USD to the target currency
  return amountInUSD * (rates[to] || 1);
};


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
