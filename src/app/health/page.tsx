"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, ShieldCheck, AlertTriangle, Download, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function FinancialHealthPage() {
  const { metrics } = useFinancialData();
  const { format } = useCurrency();
  const reportRef = useRef<HTMLDivElement>(null);

  // 1. BENCHMARKS & RATIOS
  const liquidityRatio = metrics.totalLiabilities > 0 ? (metrics.assets.cash / metrics.totalLiabilities) * 100 : 100;
  const debtToAssetRatio = metrics.totalAssets > 0 ? (metrics.totalLiabilities / metrics.totalAssets) * 100 : 0;
  const savingsRate = metrics.totalIncome > 0 ? (metrics.netCashFlow / metrics.totalIncome) * 100 : 0;
  
  // 2. SCORE CALCULATION
  let healthScore = 100;
  if (debtToAssetRatio > 50) healthScore -= 20;
  if (debtToAssetRatio > 70) healthScore -= 20; // Critical level
  if (savingsRate < 20) healthScore -= 10;      // Target is 20%
  if (savingsRate < 0) healthScore -= 20;       // Negative is bad
  if (liquidityRatio < 10) healthScore -= 15;
  healthScore = Math.max(0, healthScore);

  // 3. DOWNLOAD PDF FUNCTION
  const handleDownload = async () => {
    if (typeof window !== 'undefined') {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = reportRef.current;
        const opt = {
          margin: 10,
          filename: `Financial_Health_${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Load Script for PDF */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" async></script>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
                <BrainCircuit className="h-8 w-8 text-emerald-400" /> 
                AI Health Diagnosis
            </h1>
            <p className="text-muted-foreground">Automated risk assessment and portfolio analysis.</p>
        </div>
        <Button onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      <div ref={reportRef} className="space-y-8 bg-[#020817] p-4 rounded-xl">
          {/* Score Card */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-t-4 border-t-emerald-500 glass-panel">
                <CardHeader>
                    <CardTitle>Health Score</CardTitle>
                    <CardDescription>Composite score (0-100)</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center flex-col py-6">
                    <div className="relative h-40 w-40 flex items-center justify-center rounded-full border-8 border-white/10">
                        <div className={`text-5xl font-bold ${healthScore > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{healthScore.toFixed(0)}</div>
                        <p className="absolute bottom-8 text-xs text-muted-foreground uppercase tracking-widest">Points</p>
                    </div>
                    <p className="mt-4 font-medium text-lg text-white">
                        {healthScore > 80 ? "Excellent Condition" : healthScore > 50 ? "Stable but Needs Work" : "Critical Actions Required"}
                    </p>
                </CardContent>
            </Card>

            {/* Key Metrics with Benchmarks */}
            <Card className="glass-panel">
                <CardHeader><CardTitle>Vital Signs</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    {/* Debt Ratio */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-white">
                            <span>Debt Ratio</span>
                            <span className="font-bold">{debtToAssetRatio.toFixed(1)}%</span>
                        </div>
                        {/* FIX: Use child selector for color */}
                        <Progress value={debtToAssetRatio} className={`h-2 bg-white/10 [&>*]:${debtToAssetRatio > 50 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <p className="text-[10px] text-muted-foreground text-right">Benchmark: Keep below 50%</p>
                    </div>

                    {/* Savings Rate */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-white">
                            <span>Monthly Savings Rate</span>
                            <span className="font-bold">{savingsRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={savingsRate} className={`h-2 bg-white/10 [&>*]:${savingsRate < 20 ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <p className="text-[10px] text-muted-foreground text-right">Benchmark: Aim for 20%+</p>
                    </div>

                    {/* Net Worth */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-white">
                            <span>Net Worth</span>
                            <span className="font-bold text-amber-400">{format(metrics.netWorth)}</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 w-full"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* AI Insights List */}
          <Card className="glass-panel border-l-4 border-l-blue-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-400"/> AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {metrics.netCashFlow < 0 && (
                    <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-200 flex gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p className="text-sm"><strong>Warning: Negative Cash Flow.</strong> You are spending more than you earn. Review liabilities immediately.</p>
                    </div>
                )}
                {debtToAssetRatio > 50 && (
                     <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/30 text-amber-200 flex gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p className="text-sm"><strong>High Leverage.</strong> Debt exceeds 50% of assets. Focus on paying down loans.</p>
                     </div>
                )}
                 <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-500/30 text-emerald-200 flex gap-3">
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    <p className="text-sm"><strong>Asset Quality.</strong> Real estate holdings provide stable long-term inflation hedging.</p>
                 </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}