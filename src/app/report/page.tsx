"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Download, Calendar, FileText } from "lucide-react";
import { convert } from "@/lib/calculations";
import { useRef } from "react";

export default function ReportPage() {
  const { data, metrics, currency: displayCurrency, rates } = useFinancialData();
  const { format } = useCurrency();
  const reportRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString();

  const fmt = (val: number, fromCurr: string) => {
    const converted = convert(val, fromCurr, displayCurrency, rates);
    return format(converted);
  };

  const handleDownload = async () => {
    if (typeof window !== 'undefined') {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = reportRef.current;
        const opt = {
          margin: 10, // Increased margin for better readability
          filename: `Wealth_Master_Report_${today}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true }, 
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          // FIX: Smart Page Breaks
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } 
        };
        html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#f8f9fa]">
      {/* Scripts for PDF */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" async></script>

      <div className="mb-8 flex justify-between items-center bg-[#1e293b] p-4 rounded-xl border border-white/10 text-white shadow-lg">
        <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-400"/> Master Report</h1>
            <p className="text-sm text-slate-400">Generate a confidential statement of affairs.</p>
        </div>
        <Button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* --- REPORT CONTENT --- */}
      {/* We use a specific ID and white background for the PDF snapshot */}
      <div ref={reportRef} className="max-w-4xl mx-auto bg-white text-black p-10 rounded-sm shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900">Confidential</h1>
                <h2 className="text-xl mt-1 text-slate-700">Financial Statement</h2>
            </div>
            <div className="text-right">
                <p className="flex items-center justify-end gap-2 text-sm font-bold"><Calendar className="h-4 w-4"/> {today}</p>
                <p className="text-xs text-gray-500">Basis: {displayCurrency}</p>
            </div>
        </div>

        {/* 1. EXECUTIVE SUMMARY (Avoid breaking inside this block) */}
        <section className="mb-8 break-inside-avoid">
            <h3 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-black mb-4">1. Executive Summary</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-4 border rounded bg-slate-50">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Net Worth</p>
                    <p className="text-lg font-bold text-slate-900">{format(metrics.netWorth)}</p>
                </div>
                <div className="p-4 border rounded bg-slate-50">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Assets</p>
                    <p className="text-lg font-bold text-emerald-700">{format(metrics.totalAssets)}</p>
                </div>
                <div className="p-4 border rounded bg-slate-50">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Liabilities</p>
                    <p className="text-lg font-bold text-red-700">{format(metrics.totalLiabilities)}</p>
                </div>
                <div className="p-4 border rounded bg-slate-50">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Monthly Cash Flow</p>
                    <p className={`text-lg font-bold ${metrics.netCashFlow < 0 ? 'text-red-600' : 'text-blue-600'}`}>{format(metrics.netCashFlow)}</p>
                </div>
            </div>
        </section>

        {/* 2. ASSETS TABLE */}
        <section className="mb-8 break-inside-avoid">
            <h3 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-black mb-4">2. Asset Holdings</h3>
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="border-b-2 border-black text-gray-500">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Real Estate Rows */}
                    {data.assets.realEstate.map((a, i) => (
                        <tr key={i} className="border-b border-gray-100 break-inside-avoid">
                            <td className="py-1">{a.name} ({a.location})</td>
                            <td className="py-1 text-right font-mono">{fmt(a.currentValue, a.currency)}</td>
                        </tr>
                    ))}
                    {data.assets.underDevelopment.map((a, i) => (
                        <tr key={`dev-${i}`} className="border-b border-gray-100 text-slate-600 break-inside-avoid">
                            <td className="py-1">{a.name} (Off-Plan)</td>
                            <td className="py-1 text-right font-mono">{fmt(a.currentValue, a.currency)}</td>
                        </tr>
                    ))}
                    {/* Liquid Assets */}
                    {data.assets.cash.map((a, i) => (
                        <tr key={`c-${i}`} className="border-b border-gray-100 break-inside-avoid">
                            <td className="py-1">Cash: {a.location}</td>
                            <td className="py-1 text-right font-mono">{fmt(a.amount, a.currency)}</td>
                        </tr>
                    ))}
                    {data.assets.gold.map((a, i) => (
                        <tr key={`g-${i}`} className="border-b border-gray-100 break-inside-avoid">
                            <td className="py-1">Gold ({a.grams}g)</td>
                            <td className="py-1 text-right font-mono">{fmt(a.grams, 'GOLD_GRAM')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        {/* 3. LIABILITIES TABLE (Forces new page if not enough space) */}
        <section className="mb-8 break-inside-avoid">
            <h3 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-black mb-4">3. Liabilities</h3>
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="border-b-2 border-black text-gray-500">
                        <th className="py-2">Commitment</th>
                        <th className="py-2 text-right">Remaining</th>
                    </tr>
                </thead>
                <tbody>
                    {data.liabilities.loans.map((l, i) => (
                        <tr key={i} className="border-b border-gray-100 break-inside-avoid">
                            <td className="py-1">{l.lender} Loan</td>
                            <td className="py-1 text-right font-mono text-red-600">{fmt(l.remaining, l.currency)}</td>
                        </tr>
                    ))}
                    {data.liabilities.installments.map((l, i) => (
                        <tr key={`i-${i}`} className="border-b border-gray-100 break-inside-avoid">
                            <td className="py-1">{l.project}</td>
                            <td className="py-1 text-right font-mono text-red-600">{fmt(l.total - l.paid, l.currency)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-400 break-inside-avoid">
            Generated by Wealth Navigator Pro • {today} • Confidential
        </div>

      </div>
    </div>
  );
}