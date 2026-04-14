import type { FinancialData, Currency } from './types';
import type { ExchangeRates } from './types';

const GRAMS_PER_OUNCE = 31.1035;

export const convert = (
  amount: any,
  from: string,
  to: string,
  rates: any
): number => {
  const safeAmount = Number(amount) || 0;
  if (!rates || typeof rates !== 'object') return 0;
  if (from === to) return safeAmount;

  if (from === 'GOLD_GRAM') {
    const pricePerGram = (rates.Gold || 0) / GRAMS_PER_OUNCE;
    return convert(safeAmount * pricePerGram, 'USD', to, rates);
  }
  if (from === 'SILVER_GRAM') {
    const pricePerGram = (rates.Silver || 0) / GRAMS_PER_OUNCE;
    return convert(safeAmount * pricePerGram, 'USD', to, rates);
  }
  if (from === 'PLATINUM_GRAM') {
    const pricePerGram = (rates.Platinum || 0) / GRAMS_PER_OUNCE;
    return convert(safeAmount * pricePerGram, 'USD', to, rates);
  }

  const fromRate = Number(rates[from]) || 1;
  const toRate = Number(rates[to]) || 1;
  const amountInUSD = safeAmount / fromRate;
  return amountInUSD * toRate;
};

export const calculateMetrics = (data: FinancialData, displayCurrency: Currency, rates: ExchangeRates) => {
  if (!data || !data.assets) {
    return {
      netWorth: 0, totalAssets: 0, totalLiabilities: 0, netCashFlow: 0, operatingCashFlow: 0,
      totalIncome: 0, totalExpenses: 0,
      assets: { existingRealEstate: 0, offPlanRealEstate: 0, cash: 0, gold: 0, silver: 0, platinum: 0, other: 0 },
      liabilities: { loans: 0, installments: 0 },
      income: { salary: 0, rent: 0 },
      expenses: { loans: 0, household: 0, installmentsAvg: 0 }
    };
  }

  const { assets, liabilities, monthlyExpenses } = data;

  // --- ASSETS ---
  const realEstateValue = (assets.realEstate || []).reduce((acc, a) => acc + convert(a.currentValue, a.currency, displayCurrency, rates), 0);
  
  // USER REQUEST: Use "Paid Amount" as asset value for Off-Plan to track equity growth.
  const underDevelopmentValue = (assets.underDevelopment || []).reduce((acc, a) => {
    const linkedInst = (liabilities.installments || []).find(i => i.id === a.linkedInstallmentId);
    // If we have a linked installment, use what's actually been paid. 
    // Fallback to the 'paidToDate' field we just added, or 0.
    const paidAmount = linkedInst ? linkedInst.paid : (a as any).paidToDate || 0;
    return acc + convert(paidAmount, a.currency, displayCurrency, rates);
  }, 0);

  const cashValue = (assets.cash || []).reduce((acc, a) => acc + convert(a.amount, a.currency, displayCurrency, rates), 0);
  const goldValue = (assets.gold || []).reduce((acc, a) => acc + convert(a.grams, 'GOLD_GRAM', displayCurrency, rates), 0);
  const silverValue = (assets.silver || []).reduce((acc, a) => acc + convert(a.grams, 'SILVER_GRAM', displayCurrency, rates), 0);
  const platinumValue = (assets.platinum || []).reduce((acc, a) => acc + convert(a.grams, 'PLATINUM_GRAM', displayCurrency, rates), 0);
  const otherAssetsValue = (assets.otherAssets || []).reduce((acc, a) => acc + convert(a.value, a.currency, displayCurrency, rates), 0);

  const totalAssets = realEstateValue + underDevelopmentValue + cashValue + goldValue + silverValue + platinumValue + otherAssetsValue;

  // --- LIABILITIES ---
  const loansValue = (liabilities.loans || []).reduce((acc, l) => acc + convert(l.remaining, l.currency, displayCurrency, rates), 0);
  
  // The ACTUAL remaining debt on all installments
  const actualInstallmentsDebt = (liabilities.installments || []).reduce((acc, i) => acc + convert(i.total - i.paid, i.currency, displayCurrency, rates), 0);
  
  // USER REQUEST: To avoid negative net worth shock from total contract price, 
  // we count paid amount as Asset, and therefore ignore the "future" debt in the Net Worth calculation.
  // This ensures as they pay installments, Net Worth Velocity is POSITIVE (Equity increases).
  const netWorth = totalAssets - loansValue; 
  
  // For the dashboard, totalLiabilities includes everything.
  const totalLiabilities = loansValue + actualInstallmentsDebt;

  // --- INCOME ---
  const salaryIncome = convert(assets.salary.amount, assets.salary.currency, displayCurrency, rates);
  const rentIncome = (assets.realEstate || []).reduce((acc, a) => {
    let monthlyRent = convert(a.monthlyRent, a.rentCurrency || a.currency, displayCurrency, rates);
    if (a.rentFrequency === 'quarterly') monthlyRent /= 3;
    else if (a.rentFrequency === 'semi-annual') monthlyRent /= 6;
    else if (a.rentFrequency === 'annual') monthlyRent /= 12;
    return acc + monthlyRent;
  }, 0);
  const totalIncome = salaryIncome + rentIncome;

  // --- EXPENSES ---
  const loanExpenses = (liabilities.loans || []).reduce((acc, l) => acc + convert(l.monthlyPayment, l.currency, displayCurrency, rates), 0);

  // Total Household (For Charts)
  const householdExpenses = (monthlyExpenses.household || []).reduce((acc, e) => acc + convert(e.amount, e.currency, displayCurrency, rates), 0);

  // Kuwait Household Only (For Solvency Check)
  // We filter out anything marked as "EGP" (Egypt)
  const kuwaitHouseholdExpenses = (monthlyExpenses.household || []).reduce((acc, e) => {
    if (e.currency === 'EGP') return acc; // Skip Egypt expenses
    return acc + convert(e.amount, e.currency, displayCurrency, rates);
  }, 0);

  const installmentsAvgExpense = (liabilities.installments || []).reduce((acc, inst) => {
    let annualBurden = 0;
    if (inst.schedule && inst.schedule.length > 0) {
      const today = new Date();
      const currentYear = today.getFullYear();
      inst.schedule.forEach((item: any) => {
        const d = new Date(item.date);
        if (d.getFullYear() === currentYear) {
          annualBurden += convert(item.amount, inst.currency, displayCurrency, rates);
        }
      });
    } else {
      const amount = convert(inst.amount, inst.currency, displayCurrency, rates);
      if (inst.frequency === 'Monthly') annualBurden = amount * 12;
      else if (inst.frequency === 'Quarterly') annualBurden = amount * 4;
      else if (inst.frequency === 'Semi-Annual') annualBurden = amount * 2;
      else annualBurden = amount;
    }
    return acc + (annualBurden / 12);
  }, 0);

  const totalExpenses = loanExpenses + householdExpenses + installmentsAvgExpense;

  // --- KEY METRIC: OPERATING CASH FLOW (Salary - Kuwait Expenses) ---
  // This matches your Excel: 4500 - 350 - 977 = 3173
  const operatingCashFlow = salaryIncome - (loanExpenses + kuwaitHouseholdExpenses);

  const netCashFlow = totalIncome - totalExpenses;

  // --- PROFESSIONAL METRICS ---
  const leverageRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  // Calculate liquid assets
  const liquidAssets = cashValue + goldValue + silverValue + platinumValue;
  // How many months can user survive on liquid assets paying base household expenses?
  const liquidityMonths = householdExpenses > 0 ? (liquidAssets / householdExpenses) : 0;

  // --- TIMING METRICS (User Request) ---
  let maxInstallmentDate: Date | null = null;
  (liabilities.installments || []).forEach(inst => {
    if (inst.schedule && inst.schedule.length > 0) {
      inst.schedule.forEach(s => {
        const d = new Date(s.date);
        if (!maxInstallmentDate || d > maxInstallmentDate) maxInstallmentDate = d;
      });
    } else if (inst.nextDueDate) {
      const d = new Date(inst.nextDueDate);
      if (!maxInstallmentDate || d > maxInstallmentDate) maxInstallmentDate = d;
    }
  });

  let maxLoanDate: Date | null = null;
  (liabilities.loans || []).forEach(l => {
    if (l.finalPayment) {
      const d = new Date(l.finalPayment);
      if (!maxLoanDate || d > maxLoanDate) maxLoanDate = d;
    } else if (l.remaining > 0 && l.monthlyPayment > 0) {
      const monthsLeft = Math.ceil(l.remaining / l.monthlyPayment);
      const d = new Date();
      d.setMonth(d.getMonth() + monthsLeft);
      if (!maxLoanDate || d > maxLoanDate) maxLoanDate = d;
    }
  });

  const actualWealth = realEstateValue + underDevelopmentValue; 
  
  const totalOffPlanContractValue = (assets.underDevelopment || []).reduce((acc, a) => acc + convert(a.purchasePrice, a.currency, displayCurrency, rates), 0);
  
  const grossPortfolioValue = realEstateValue + totalOffPlanContractValue + cashValue + goldValue + silverValue + platinumValue + otherAssetsValue;

  const totalFutureAssetValue = realEstateValue + 
    (assets.underDevelopment || []).reduce((acc, a) => acc + convert(a.currentValue, a.currency, displayCurrency, rates), 0) + 
    cashValue + goldValue + silverValue + platinumValue + otherAssetsValue;
  
  const futureNetWorthCalculated = totalFutureAssetValue - loansValue;

  return {
    // Net Worth is Equity-based (Assets - Bank Loans), where Assets include Paid-to-date Off-plan equity.
    netWorth, 
    totalAssets, 
    actualWealth,
    totalOffPlanContractValue,
    grossPortfolioValue,
    futureNetWorth: futureNetWorthCalculated,
    offPlanCompletionDate: maxInstallmentDate ? (maxInstallmentDate as Date).toISOString() : null,
    loansCompletionDate: maxLoanDate ? (maxLoanDate as Date).toISOString() : null,
    debtFreeDate: (maxInstallmentDate || maxLoanDate) ? 
      new Date(Math.max((maxInstallmentDate as any || 0), (maxLoanDate as any || 0))).toISOString() : null,
    
    // totalLiabilities returned here is the ACTUAL total (Loans + Remaining Installments) for the UI dashboard.
    totalLiabilities: loansValue + actualInstallmentsDebt, 
    netCashFlow, 
    operatingCashFlow,
    totalIncome, 
    totalExpenses,
    assets: { existingRealEstate: realEstateValue, offPlanRealEstate: underDevelopmentValue, cash: cashValue, gold: goldValue, silver: silverValue, platinum: platinumValue, other: otherAssetsValue },
    liabilities: { loans: loansValue, installments: actualInstallmentsDebt },
    income: { salary: salaryIncome, rent: rentIncome },
    expenses: { loans: loanExpenses, household: householdExpenses, installmentsAvg: installmentsAvgExpense },
    professional: { leverageRatio, liquidityMonths, liquidAssets }
  };
};