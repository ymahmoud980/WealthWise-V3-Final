
import type { FinancialData, ExchangeRates, Currency } from './types';

// This file will hold the core calculation logic based on your Gemini Pro app.
// We are moving the logic here to keep components clean.

// Default rates are used as a fallback or for non-currency items.
export const rates: ExchangeRates = {
    USD: 1,
    EGP: 47.75, 
    KWD: 0.3072,
    TRY: 41.88,
    GOLD: 128.64, // Fallback price per gram
    SILVER: 1.553, // Fallback price per gram
};

export function convert(amount: number, fromCurrency: Currency | 'GOLD' | 'SILVER', toCurrency: Currency, exchangeRates: ExchangeRates): number {
    if (typeof amount !== 'number' || isNaN(amount)) return 0;
    if (fromCurrency === toCurrency) return amount;
    
    const rateFrom = exchangeRates[fromCurrency];
    const rateTo = exchangeRates[toCurrency];

    if (!rateFrom || !rateTo) return 0;

    // First, convert the amount to a base currency (USD)
    const amountInUsd = fromCurrency === 'GOLD' || fromCurrency === 'SILVER'
      ? amount * rateFrom // For precious metals, it's a direct multiplication (grams * price_per_gram)
      : amount / rateFrom; // For currencies, we divide to get to the base
    
    // Then, convert from USD to the target currency
    return amountInUsd * rateTo;
}

export function calculateMetrics(data: FinancialData, displayCurrency: Currency, liveRates: ExchangeRates) {
    const convertToDisplay = (amount: number, from: Currency | 'GOLD' | 'SILVER') => convert(amount, from, displayCurrency, liveRates);

    // --- ASSET CALCULATIONS ---
    const offPlanAssetsValue = (data.assets.underDevelopment || []).reduce((sum, p) => sum + convertToDisplay(p.currentValue, p.currency), 0);
    const existingRealEstateValue = (data.assets.realEstate || []).reduce((sum, p) => sum + convertToDisplay(p.currentValue, p.currency), 0);
    const cashValue = (data.assets.cash || []).reduce((sum, c) => sum + convertToDisplay(c.amount, c.currency), 0);
    const goldValue = (data.assets.gold || []).reduce((sum, g) => sum + convertToDisplay(g.grams, "GOLD"), 0);
    const silverValue = (data.assets.silver || []).reduce((sum, s) => sum + convertToDisplay(s.grams, "SILVER"), 0);
    const otherAssetsValue = (data.assets.otherAssets || []).reduce((sum, o) => sum + convertToDisplay(o.value, o.currency), 0);

    const totalAssets = existingRealEstateValue + offPlanAssetsValue + cashValue + goldValue + silverValue + otherAssetsValue;
    
    const assetsBreakdown = {
        existingRealEstate: existingRealEstateValue,
        offPlanRealEstate: offPlanAssetsValue,
        cash: cashValue,
        gold: goldValue,
        silver: silverValue,
        other: otherAssetsValue
    };

    // --- LIABILITY CALCULATIONS ---
    const loansValue = (data.liabilities.loans || []).reduce((sum, l) => sum + convertToDisplay(l.remaining, l.currency), 0);
    const installmentsValue = (data.liabilities.installments || []).reduce((sum, i) => sum + convertToDisplay(i.total - i.paid, i.currency), 0);
    const totalLiabilities = loansValue + installmentsValue;
    
    const liabilitiesBreakdown = {
        loans: loansValue,
        installments: installmentsValue
    };

    // --- CASH FLOW CALCULATIONS ---
    const salaryIncome = data.assets.salary ? convertToDisplay(data.assets.salary.amount, data.assets.salary.currency) : 0;
    const rentIncome = (data.assets.realEstate || []).reduce((sum, p) => {
        const rentInDisplayCurrency = convertToDisplay(p.monthlyRent, p.rentCurrency || p.currency);
        if (p.rentFrequency === 'semi-annual') {
            return sum + (rentInDisplayCurrency / 6);
        }
        if (p.rentFrequency === 'monthly') {
          return sum + rentInDisplayCurrency;
        }
        return sum;
    }, 0);
    const totalIncome = salaryIncome + rentIncome;

    const incomeBreakdown = {
        salary: salaryIncome,
        rent: rentIncome
    };

    const monthlyInstallmentAverage = (data.liabilities.installments || []).reduce((sum, p) => {
        let monthlyCost = 0;
        if (p.frequency === 'Annual') monthlyCost = p.amount / 12;
        else if (p.frequency === 'Semi-Annual') monthlyCost = p.amount / 6;
        else if (p.frequency === 'Quarterly') monthlyCost = p.amount / 3;
        return sum + convertToDisplay(monthlyCost, p.currency);
    }, 0);

    const loanExpenses = (data.liabilities.loans || []).reduce((sum, l) => sum + convertToDisplay(l.monthlyPayment, l.currency), 0);
    const householdExpenses = (data.monthlyExpenses.household || []).reduce((sum, h) => sum + convertToDisplay(h.amount, h.currency), 0);
    const totalExpenses = loanExpenses + householdExpenses + monthlyInstallmentAverage;

    const expensesBreakdown = {
        loans: loanExpenses,
        household: householdExpenses,
        installmentsAvg: monthlyInstallmentAverage
    };

    // --- FINAL METRICS ---
    const netWorth = totalAssets - totalLiabilities;
    const netCashFlow = totalIncome - totalExpenses;

    return {
        netWorth,
        totalAssets,
        totalLiabilities,
        netCashFlow,
        totalIncome,
        totalExpenses,
        assets: assetsBreakdown,
        liabilities: liabilitiesBreakdown,
        income: incomeBreakdown,
        expenses: expensesBreakdown
    };
}
