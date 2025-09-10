
import type { FinancialData, ExchangeRates, Currency } from './types';

// This file will hold the core calculation logic based on your Gemini Pro app.
// We are moving the logic here to keep components clean.

export const rates: ExchangeRates = {
    USD: 1,
    EGP: 48.30,
    KWD: 0.307,
    TRY: 32.85,
    GOLD_GRAM: 75.50
};

export function convert(amount: number, fromCurrency: Currency | 'GOLD_GRAM', toCurrency: Currency, exchangeRates: ExchangeRates): number {
    if (typeof amount !== 'number' || isNaN(amount)) return 0;
    if (fromCurrency === toCurrency) return amount;
    
    const rateMatrix = buildRateMatrix(exchangeRates);
    const rate = rateMatrix[fromCurrency]?.[toCurrency];
    
    if (rate === undefined) {
        console.error(`Conversion rate from ${fromCurrency} to ${toCurrency} not found.`);
        return 0;
    }
    return amount * rate;
}

function buildRateMatrix(baseRates: ExchangeRates) {
    const currencies = Object.keys(baseRates) as (Currency | 'GOLD_GRAM')[];
    const matrix: { [from: string]: { [to: string]: number } } = {};
    for (const from of currencies) {
        matrix[from] = {};
        for (const to of currencies) {
            matrix[from][to] = baseRates[to] / baseRates[from];
        }
    }
    return matrix;
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
