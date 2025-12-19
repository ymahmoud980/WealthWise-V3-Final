"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, ShieldCheck, AlertTriangle, TrendingUp, BrainCircuit, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinancialHealthPage() {
  const { metrics } = useFinancialData();
  const { format } = useCurrency();

  // 1. CALCULATE HEALTH RATIOS
  const liquidityRatio = metrics.totalLiabilities > 0 ? (metrics.assets.cash / metrics.totalLiabilities) * 100 : 100;
  const debtToAssetRatio = metrics.totalAssets > 0 ? (metrics.totalLiabilities / metrics.totalAssets) * 100 : 0;
  const savingsRate = metrics.totalIncome > 0 ? (metrics.netCashFlow / metrics.totalIncome) * 100 : 0;
  
  // 2. GENERATE AI SCORE (0-100)
  let healthScore = 100;
  if (debtToAssetRatio > 50) healthScore -= 20;
  if (debtToAssetRatio > 80) healthScore -= 20;
  if (savingsRate < 10) healthScore -= 15;
  if (liquidityRatio < 10) healthScore -= 15;
  if (metrics.netCashFlow < 0) healthScore -= 30; // Heavy penalty for negative cash flow

  // 3. GENERATE AI INSIGHTS
  const insights = [];
  if (metrics.netCashFlow < 0) {
    insights.push({ type: 'danger', text: "Negative Cash Flow Detected: You are spending more than you earn monthly. Immediate budget review required." });
  } else {
    insights.push({ type: 'success', text: "Positive Cash Flow: You are generating surplus cash monthly. Consider reinvesting into high-yield assets." });
  }

  if (debtToAssetRatio > 50) {
    insights.push({ type: 'warning', text: `High Leverage: Your debt is ${debtToAssetRatio.toFixed(1)}% of your assets. Consider paying down loans before acquiring new debt.` });
  } else {
    insights.push({ type: 'success', text: "Healthy Leverage: Your debt-to-asset ratio is sustainable." });
  }

  if (metrics.assets.cash < metrics.totalExpenses * 3) {
    insights.push({ type: 'warning', text: "Liquidity Alert: Cash reserves are low relative to monthly expenses. Aim for 3-6 months of emergency funds." });
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <BrainCircuit className="h-8 w-8 text-primary" /> 
                AI Financial Diagnosis
            </h1>
            <p className="text-muted-foreground">Automated analysis of your portfolio health and risk factors.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Download Report
        </Button>
      </div>

      {/* Score Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-t-4 border-t-primary glass-panel">
            <CardHeader>
                <CardTitle>Overall Health Score</CardTitle>
                <CardDescription>Composite score based on liquidity, leverage, and cash flow.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center flex-col py-6">
                <div className="relative h-40 w-40 flex items-center justify-center rounded-full border-8 border-primary/20">
                    <div className="text-4xl font-bold text-primary">{Math.max(0, healthScore)}</div>
                    <div className="absolute top-0 left-0 h-full w-full rounded-full border-8 border-primary border-t-transparent animate-spin duration-[3s]" style={{animationPlayState: 'paused', transform: `rotate(${healthScore * 3.6}deg)`}}></div>
                </div>
                <p className="mt-4 font-medium text-lg">{healthScore > 80 ? "Excellent" : healthScore > 50 ? "Moderate" : "Critical Attention Needed"}</p>
            </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="glass-panel">
            <CardHeader><CardTitle>Vital Signs</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Debt Ratio (Lower is better)</span><span className="font-bold">{debtToAssetRatio.toFixed(1)}%</span></div>
                    <Progress value={debtToAssetRatio} className="h-2 bg-slate-800" indicatorClassName={debtToAssetRatio > 50 ? "bg-red-500" : "bg-emerald-500"} />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Monthly Savings Rate</span><span className="font-bold">{savingsRate.toFixed(1)}%</span></div>
                    <Progress value={savingsRate} className="h-2 bg-slate-800" indicatorClassName={savingsRate < 0 ? "bg-red-500" : "bg-blue-500"} />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Net Worth</span><span className="font-bold text-amber-400">{format(metrics.netWorth)}</span></div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400" style={{width: '100%'}}></div>
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
            {insights.map((insight, idx) => (
                <div key={idx} className={`p-4 rounded-lg border flex gap-3 ${
                    insight.type === 'danger' ? 'bg-red-900/10 border-red-500/30 text-red-200' :
                    insight.type === 'warning' ? 'bg-amber-900/10 border-amber-500/30 text-amber-200' :
                    'bg-emerald-900/10 border-emerald-500/30 text-emerald-200'
                }`}>
                    {insight.type === 'danger' ? <AlertCircle className="h-5 w-5 shrink-0" /> : 
                     insight.type === 'warning' ? <AlertTriangle className="h-5 w-5 shrink-0" /> : 
                     <ShieldCheck className="h-5 w-5 shrink-0" />}
                    <p className="text-sm leading-relaxed">{insight.text}</p>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper icon
function AlertCircle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
}