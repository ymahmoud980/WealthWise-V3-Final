
import type { FinancialData, ExchangeRates, Currency } from './types';

// Constants for conversion
const GRAMS_PER_TROY_OUNCE = 31.1035;

export function convert(amount: number, from: Currency | 'GOLD_GRAM' | 'SILVER_GRAM', to: Currency, exchangeRates: ExchangeRates): number {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) return 0;

    let amountInUsd: number;

    // --- Step 1: Convert the input amount to a standard USD value ---
    if (from === 'GOLD_GRAM' || from === 'SILVER_GRAM') {
        // This is for a commodity (gold/silver).
        // The 'amount' is in grams. We need to multiply by the price per gram in USD.
        const pricePerGramInUsd = exchangeRates[from];
        if (!pricePerGramInUsd) return 0;
        amountInUsd = amount * pricePerGramInUsd;
    } else {
        // This is for a standard currency.
        // We convert it to USD by dividing by its exchange rate relative to USD.
        const rateFrom = exchangeRates[from as Currency];
        if (!rateFrom) return 0;
        amountInUsd = amount / rateFrom;
    }

    // --- Step 2: Convert the USD value to the target display currency ---
    const rateTo = exchangeRates[to as Currency];
    if (!rateTo) return 0;
    
    // This was the critical bug. It should multiply, not divide.
    return amountInUsd * rateTo;
}


export function calculateMetrics(data: FinancialData, displayCurrency: Currency, liveRates: ExchangeRates) {
    const convertToDisplay = (amount: number, from: Currency | 'GOLD_GRAM' | 'SILVER_GRAM') => convert(amount, from, displayCurrency, liveRates);

    // --- ASSET CALCULATIONS ---
    const offPlanAssetsValue = (data.assets.underDevelopment || []).reduce((sum, p) => sum + convertToDisplay(p.currentValue, p.currency), 0);
    const existingRealEstateValue = (data.assets.realEstate || []).reduce((sum, p) => sum + convertToDisplay(p.currentValue, p.currency), 0);
    const cashValue = (data.assets.cash || []).reduce((sum, c) => sum + convertToDisplay(c.amount, c.currency), 0);
    const goldValue = (data.assets.gold || []).reduce((sum, g) => sum + convertToDisplay(g.grams, "GOLD_GRAM"), 0);
    const silverValue = (data.assets.silver || []).reduce((sum, s) => sum + convertToDisplay(s.grams, "SILVER_GRAM"), 0);
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
        if (!p.monthlyRent || p.monthlyRent <= 0) return sum;
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
