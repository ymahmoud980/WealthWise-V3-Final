"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Printer, Calendar } from "lucide-react";
import { convert } from "@/lib/calculations"; // Ensure we can convert raw numbers

export default function ReportPage() {
  const { data, metrics, currency: displayCurrency, rates } = useFinancialData();
  const { format } = useCurrency();
  const today = new Date().toLocaleDateString();

  // Helper to format raw numbers to the display currency
  const fmt = (val: number, fromCurr: string) => {
    // If it's gold/silver, 'val' is grams. If currency, 'val' is money.
    const converted = convert(val, fromCurr, displayCurrency, rates);
    return format(converted);
  };

  return (
    <div className="min-h-screen bg-white text-black p-8 font-serif print:p-0 print:bg-white">
      
      {/* Print Controls (Hidden when printing) */}
      <div className="mb-8 flex justify-between items-center print:hidden bg-slate-900 text-white p-4 rounded-xl">
        <div>
            <h1 className="text-xl font-sans font-bold">Master Financial Report</h1>
            <p className="text-sm text-slate-400">Generates a detailed snapshot of all holdings.</p>
        </div>
        <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      {/* --- REPORT DOCUMENT START --- */}
      <div className="max-w-4xl mx-auto border border-gray-200 p-8 shadow-sm print:border-0 print:shadow-none">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold uppercase tracking-widest">Confidential</h1>
                <h2 className="text-xl mt-1">Financial Statement of Affairs</h2>
            </div>
            <div className="text-right">
                <p className="flex items-center justify-end gap-2 text-sm font-bold"><Calendar className="h-4 w-4"/> {today}</p>
                <p className="text-xs text-gray-500">Currency Basis: {displayCurrency}</p>
            </div>
        </div>

        {/* 1. EXECUTIVE SUMMARY */}
        <section className="mb-8">
            <h3 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-black mb-4">1. Executive Summary</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-4 border rounded">
                    <p className="text-xs text-gray-500 uppercase">Net Worth</p>
                    <p className="text-xl font-bold">{format(metrics.netWorth)}</p>
                </div>
                <div className="p-4 border rounded">
                    <p className="text-xs text-gray-500 uppercase">Total Assets</p>
                    <p className="text-xl font-bold text-green-700">{format(metrics.totalAssets)}</p>
                </div>
                <div className="p-4 border rounded">
                    <p className="text-xs text-gray-500 uppercase">Total Liabilities</p>
                    <p className="text-xl font-bold text-red-700">{format(metrics.totalLiabilities)}</p>
                </div>
                <div className="p-4 border rounded">
                    <p className="text-xs text-gray-500 uppercase">Monthly Cashflow</p>
                    <p className={`text-xl font-bold ${metrics.netCashFlow < 0 ? 'text-red-600' : 'text-blue-600'}`}>{format(metrics.netCashFlow)}</p>
                </div>
            </div>
        </section>

        {/* 2. REAL ESTATE ASSETS */}
        <section className="mb-8 break-inside-avoid">
            <h3 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-black mb-4">2. Real Estate Holdings</h3>
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="py-2">Property</th>
                        <th className="py-2">Location</th>
                        <th className="py-2 text-right">Current Value</th>
                        <th className="py-2 text-right">Monthly Rent</th>
                    </tr>
                </thead>
                <tbody>
                    {data.assets.realEstate.map((a, i) => (
                        <tr key={i} className="border-b border-gray-200">
                            <td className="py-2 font-medium">{a.name}</td>
                            <td className="py-2 text-gray-600">{a.location}</td>
                            <td className="py-2 text-right font-mono">{fmt(a.currentValue, a.currency)}</td>
                            <td className="py-2 text-right text-gray-600">{a.monthlyRent > 0 ? fmt(a.monthlyRent, a.rentCurrency || a.currency) : '-'}</td>
                        </tr>
                    ))}
                    {/* Add Under Development */}
                    {data.assets.underDevelopment.map((a, i) => (
                        <tr key={`dev-${i}`} className="border-b border-gray-200 bg-gray-50">
                            <td className="py-2 font-medium">{a.name} <span className="text-xs bg-gray-200 px-1 rounded">Off-Plan</span></td>
                            <td className="py-2 text-gray-600">{a.location}</td>
                            <td className="py-2 text-right font-mono">{fmt(a.currentValue, a.currency)}</td>
                            <td className="py-2 text-right text-gray-400">N/A</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        {/* 3. LIQUID & OTHER ASSETS */}
        <section className="mb-8 break-inside-avoid">
            <h3 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-black mb-4">3. Liquid & Other Assets</h3>
            <table className="w-full text-sm text-left">
                <tbody>
                    {data.assets.cash.map((a, i) => (
                        <tr key={i} className="border-b border-gray-100">
                            <td className="py-1">Cash: {a.location}</td>
                            <td className="py-1 text-right font-mono">{fmt(a.amount, a.currency)}</td>
                        </tr>
                    ))}
                    {data.assets.gold.map((a, i) => (
                        <tr key={i} className="border-b border-gray-100">
                            <td className="py-1">Gold: {a.location} ({a.grams}g)</td>
                            <td className="py-1 text-right font-mono">{fmt(a.grams, 'GOLD_GRAM')}</td>
                        </tr>
                    ))}
                    {data.assets.silver.map((a, i) => (
                        <tr key={i} className="border-b border-gray-100">
                            <td className="py-1">Silver: {a.location} ({a.grams}g)</td>
                            <td className="py-1 text-right font-mono">{fmt(a.grams, 'SILVER_GRAM')}</td>
                        </tr>
                    ))}
                    {data.assets.otherAssets.map((a, i) => (
                        <tr key={i} className="border-b border-gray-100">
                            <td className="py-1">{a.description}</td>
                            <td className="py-1 text-right font-mono">{fmt(a.value, a.currency)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        {/* 4. LIABILITIES & COMMITMENTS */}
        <section className="mb-8 break-inside-avoid">
            <h3 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-black mb-4">4. Liabilities Schedule</h3>
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="py-2">Commitment</th>
                        <th className="py-2">Type</th>
                        <th className="py-2 text-right">Outstanding</th>
                        <th className="py-2 text-right">Next Payment</th>
                    </tr>
                </thead>
                <tbody>
                    {data.liabilities.loans.map((l, i) => (
                        <tr key={i} className="border-b border-gray-200">
                            <td className="py-2 font-medium">{l.lender}</td>
                            <td className="py-2 text-xs uppercase">Bank Loan</td>
                            <td className="py-2 text-right font-mono text-red-600">{fmt(l.remaining, l.currency)}</td>
                            <td className="py-2 text-right">{fmt(l.monthlyPayment, l.currency)}/mo</td>
                        </tr>
                    ))}
                    {data.liabilities.installments.map((l, i) => (
                        <tr key={i} className="border-b border-gray-200">
                            <td className="py-2 font-medium">{l.project}</td>
                            <td className="py-2 text-xs uppercase">Installment ({l.frequency})</td>
                            <td className="py-2 text-right font-mono text-red-600">{fmt(l.total - l.paid, l.currency)}</td>
                            <td className="py-2 text-right">{fmt(l.amount, l.currency)} <br/><span className="text-[10px] text-gray-500">{l.nextDueDate}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-400">
            Generated by Wealth Navigator Pro • {today} • Confidential
        </div>

      </div>
    </div>
  );
}