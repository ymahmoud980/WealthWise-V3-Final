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
  const debtToIncomeRatio = totalIncome > 0 ? ((loanExpenses + installmentsAvgExpense) / totalIncome) * 100 : 0;
  const savingsRate = totalIncome > 0 ? (operatingCashFlow / totalIncome) * 100 : 0;

  // Calculate liquid assets (cash + bullion that can be sold quickly)
  const liquidAssets = cashValue + goldValue + silverValue + platinumValue;
  // CASH-only emergency runway (excludes bullion, which may not be instantly liquid)
  const trueCashOnly = cashValue;

  // ---- EMERGENCY RUNWAY (core wealth-protection metric) -----------------
  // Monthly burn = the minimum a user must pay each month even with zero income.
  // We include: household expenses + loan payments + average installment burden.
  const monthlyBurn = householdExpenses + loanExpenses + installmentsAvgExpense;

  // Runway in months under three scenarios:
  //   1. Cash-only (strictest – what most planners use)
  //   2. Cash + Bullion (achievable in days)
  //   3. Full liquid + ability to sell off-plan deposits (worst case)
  const runwayCashMonths     = monthlyBurn > 0 ? trueCashOnly / monthlyBurn : 0;
  const runwayLiquidMonths   = monthlyBurn > 0 ? liquidAssets / monthlyBurn : 0;
  const runwayLiquidPlusOff  = monthlyBurn > 0 ? (liquidAssets + underDevelopmentValue) / monthlyBurn : 0;

  // Recommended emergency fund target (industry standard: 6 months for two-income
  // households, 12+ months for single-income / variable-income, and 24 months for
  // anyone supporting dependents in inflationary economies).  We expose a "two-year"
  // target as the headline figure because that's what the user explicitly asked for.
  const emergencyTarget6mo  = monthlyBurn * 6;
  const emergencyTarget12mo = monthlyBurn * 12;
  const emergencyTarget24mo = monthlyBurn * 24;

  const emergencyProgressPct = emergencyTarget24mo > 0
    ? Math.min(100, (trueCashOnly / emergencyTarget24mo) * 100)
    : 0;

  // Liquidity (legacy field name kept for backwards compatibility)
  const liquidityMonths = monthlyBurn > 0 ? (liquidAssets / monthlyBurn) : 0;

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
    // ---- Core (both branches) -------------------------------------------
    // Net Worth is Equity-based (Assets − Bank Loans), where Assets include
    // Paid-to-date Off-plan equity.  Avoids the negative-shock effect of
    // counting unbuilt off-plan contract totals.
    netWorth,
    totalAssets,
    // totalLiabilities returned here is the ACTUAL total (loans + remaining
    // installments) so the dashboard shows the real debt picture.
    totalLiabilities: loansValue + actualInstallmentsDebt,
    netCashFlow,
    operatingCashFlow,
    totalIncome,
    totalExpenses,

    // ---- Off-plan / debt-free milestones (from remote branch) -----------
    actualWealth,
    totalOffPlanContractValue,
    grossPortfolioValue,
    futureNetWorth: futureNetWorthCalculated,
    offPlanCompletionDate: maxInstallmentDate ? (maxInstallmentDate as Date).toISOString() : null,
    loansCompletionDate: maxLoanDate ? (maxLoanDate as Date).toISOString() : null,
    debtFreeDate: (maxInstallmentDate || maxLoanDate)
      ? new Date(Math.max((maxInstallmentDate as any || 0), (maxLoanDate as any || 0))).toISOString()
      : null,

    // ---- Emergency-fund engine (new) -----------------------------------
    monthlyBurn,

    assets: { existingRealEstate: realEstateValue, offPlanRealEstate: underDevelopmentValue, cash: cashValue, gold: goldValue, silver: silverValue, platinum: platinumValue, other: otherAssetsValue },
    liabilities: { loans: loansValue, installments: actualInstallmentsDebt },
    income: { salary: salaryIncome, rent: rentIncome },
    expenses: { loans: loanExpenses, household: householdExpenses, installmentsAvg: installmentsAvgExpense },
    professional: {
      leverageRatio, liquidityMonths, liquidAssets,
      debtToIncomeRatio, savingsRate,
    },
    emergency: {
      monthlyBurn,
      cashOnRunway: trueCashOnly,
      runwayCashMonths,
      runwayLiquidMonths,
      runwayLiquidPlusOff,
      target6mo: emergencyTarget6mo,
      target12mo: emergencyTarget12mo,
      target24mo: emergencyTarget24mo,
      progressPct: emergencyProgressPct,
      shortfall24mo: Math.max(0, emergencyTarget24mo - trueCashOnly),
    },
  };
};