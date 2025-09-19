
import type { FinancialData, ExchangeRates, Currency } from './types';

// This file will hold the core calculation logic based on your Gemini Pro app.
// We are moving the logic here to keep components clean.

export const rates: ExchangeRates = {
    USD: 1,
    EGP: 48.30,
    KWD: 0.307,
    TRY: 32.85,
    GOLD_GRAM: 118.42 // Price per gram in USD
};

export function convert(amount: number, fromCurrency: Currency | 'GOLD_GRAM', toCurrency: Currency, exchangeRates: ExchangeRates): number {
    if (typeof amount !== 'number' || isNaN(amount)) return 0;
    if (fromCurrency === toCurrency) return amount;
    
    // The user wants a direct conversion, but exchange rates are typically quoted against a base currency (like USD).
    // A direct conversion rate (e.g., EGP to KWD) is calculated as (EGP_to_USD) * (USD_to_KWD).
    // The current logic correctly implements this by converting to a common base (USD) first.
    // Let's simplify the function signature but keep the reliable calculation method.
    const rateFrom = exchangeRates[fromCurrency];
    const rateTo = exchangeRates[toCurrency];

    if (!rateFrom || !rateTo) return 0;

    const amountInUsd = amount / rateFrom;
    return amountInUsd * rateTo;
}

export function calculateMetrics(data: FinancialData, displayCurrency: Currency) {
    const convertToDisplay = (amount: number, from: Currency | 'GOLD_GRAM') => convert(amount, from, displayCurrency, rates);

    // --- ASSET CALCULATIONS ---
    const offPlanAssetsValue = data.assets.underDevelopment.reduce((sum, p) => sum + convertToDisplay(p.currentValue, p.currency), 0);
    const existingRealEstateValue = data.assets.realEstate.reduce((sum, p) => sum + convertToDisplay(p.currentValue, p.currency), 0);
    const cashValue = data.assets.cash.reduce((sum, c) => sum + convertToDisplay(c.amount, c.currency), 0);
    const goldValue = data.assets.gold.reduce((sum, g) => sum + convertToDisplay(g.grams, "GOLD_GRAM"), 0);
    const otherAssetsValue = data.assets.otherAssets.reduce((sum, o) => sum + convertToDisplay(o.value, o.currency), 0);

    const totalAssets = existingRealEstateValue + offPlanAssetsValue + cashValue + goldValue + otherAssetsValue;
    
    const assetsBreakdown = {
        existingRealEstate: existingRealEstateValue,
        offPlanRealEstate: offPlanAssetsValue,
        cash: cashValue,
        gold: goldValue,
        other: otherAssetsValue
    };

    // --- LIABILITY CALCULATIONS ---
    const loansValue = data.liabilities.loans.reduce((sum, l) => sum + convertToDisplay(l.remaining, l.currency), 0);
    const installmentsValue = data.liabilities.installments.reduce((sum, i) => sum + convertToDisplay(i.total - i.paid, i.currency), 0);
    const totalLiabilities = loansValue + installmentsValue;
    
    const liabilitiesBreakdown = {
        loans: loansValue,
        installments: installmentsValue
    };

    // --- CASH FLOW CALCULATIONS ---
    const salaryIncome = convertToDisplay(data.assets.salary.amount, data.assets.salary.currency);
    const rentIncome = data.assets.realEstate.reduce((sum, p) => {
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

    const monthlyInstallmentAverage = data.liabilities.installments.reduce((sum, p) => {
        let monthlyCost = 0;
        if (p.frequency === 'Annual') monthlyCost = p.amount / 12;
        if (p.frequency === 'Semi-Annual') monthlyCost = p.amount / 6;
        if (p.frequency === 'Quarterly') monthlyCost = p.amount / 3;
        return sum + convertToDisplay(monthlyCost, p.currency);
    }, 0);

    const loanExpenses = data.liabilities.loans.reduce((sum, l) => sum + convertToDisplay(l.monthlyPayment, l.currency), 0);
    const householdExpenses = data.monthlyExpenses.household.reduce((sum, h) => sum + convertToDisplay(h.amount, h.currency), 0);
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
