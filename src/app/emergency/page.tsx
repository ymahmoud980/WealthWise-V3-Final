"use client";

/**
 * Emergency Fund Planner — 24-Month Roadmap
 * ------------------------------------------------------------------
 * Turns the user's monthly burn rate into a concrete, milestoned
 * accumulation plan for a 2-year emergency fund.  Suggests
 * the right deployment vehicle for each tier (checking → HYSA →
 * 4-week T-bill ladder → 13-week T-bills), and shows the projected
 * date of completion at the user's current savings rate.
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import {
  ShieldCheck,
  Landmark,
  PiggyBank,
  Banknote,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const TIERS = [
  { months: 1, label: "Tier 1 · Survival", vehicle: "Checking + High-Yield Savings (HYSA)", note: "Instant liquidity — pay rent next month even if income stops today.", icon: Banknote, color: "rose" },
  { months: 3, label: "Tier 2 · Stability", vehicle: "High-Yield Savings (HYSA, 4-5% APY)", note: "Covers a typical short job loss in most markets.", icon: PiggyBank, color: "amber" },
  { months: 6, label: "Tier 3 · Resilience", vehicle: "HYSA + 4-week T-Bill Ladder", note: "Industry-standard baseline for dual-income households.", icon: ShieldCheck, color: "emerald" },
  { months: 12, label: "Tier 4 · Independence", vehicle: "Mix: 50% HYSA, 50% 13-week T-Bill ladder", note: "Bridges most career transitions and lengthy illnesses.", icon: ShieldCheck, color: "cyan" },
  { months: 24, label: "Tier 5 · Strategic Reserve", vehicle: "60% Treasuries (mix of 3/6/12-month), 20% I-Bonds, 20% HYSA", note: "Inflation-hedged. Optionality during career pivots or downturns.", icon: Landmark, color: "violet" },
] as const;

export default function EmergencyPlanPage() {
  const { data, metrics } = useFinancialData();
  const { format, currency } = useCurrency();

  // Allow user to override burn / savings for what-if scenarios.
  const defaultBurn = Math.round(metrics?.emergency?.monthlyBurn || 0);
  const defaultCash = Math.round(metrics?.emergency?.cashOnRunway || 0);
  const defaultSavings = Math.max(0, Math.round(metrics?.operatingCashFlow || 0));

  const [burn, setBurn] = useState<number>(defaultBurn);
  const [cash, setCash] = useState<number>(defaultCash);
  const [monthlySaving, setMonthlySaving] = useState<number>(defaultSavings);
  const [apy, setApy] = useState<number>(4.25); // typical 2026 HYSA / 3-mo T-bill yield

  const target24 = burn * 24;
  const shortfall = Math.max(0, target24 - cash);
  const progress = target24 > 0 ? Math.min(100, (cash / target24) * 100) : 0;

  // Months to reach target, given compounding monthly savings + interest.
  const monthsToTarget = useMemo(() => {
    if (cash >= target24) return 0;
    if (monthlySaving <= 0) return Infinity;
    let balance = cash;
    let m = 0;
    const monthlyRate = apy / 100 / 12;
    while (balance < target24 && m < 600) {
      balance = balance * (1 + monthlyRate) + monthlySaving;
      m++;
    }
    return m >= 600 ? Infinity : m;
  }, [cash, target24, monthlySaving, apy]);

  // Build a 36-month projection chart
  const projection = useMemo(() => {
    const monthlyRate = apy / 100 / 12;
    let bal = cash;
    const arr: { month: number; balance: number; label: string }[] = [];
    for (let m = 0; m <= 36; m++) {
      arr.push({ month: m, balance: Math.round(bal), label: `M+${m}` });
      bal = bal * (1 + monthlyRate) + monthlySaving;
    }
    return arr;
  }, [cash, monthlySaving, apy]);

  return (
    <div className="space-y-8 pb-24">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end gap-6 justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Two-Year Emergency Plan
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Build the runway that lets you survive 24 months with zero income.
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Target</p>
          <p className="text-3xl font-bold text-white">{format(target24)}</p>
          <p className="text-xs text-slate-500">= {format(burn)} × 24 months</p>
        </div>
      </motion.header>

      {/* Progress meter */}
      <Card className="bento-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                Current cash on hand
              </p>
              <p className="text-3xl font-bold text-white">{format(cash)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                Progress to 24 months
              </p>
              <p className="text-3xl font-bold text-emerald-400">{progress.toFixed(1)}%</p>
            </div>
          </div>
          <Progress value={progress} className="h-3 bg-white/5" />
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span>Shortfall: <span className="text-rose-300 font-mono">{format(shortfall)}</span></span>
            <span>
              At <span className="text-white font-mono">{format(monthlySaving)}/mo</span> · APY <span className="text-white font-mono">{apy.toFixed(2)}%</span> →{" "}
              {monthsToTarget === Infinity ? (
                <span className="text-rose-300">unreachable at this rate</span>
              ) : monthsToTarget === 0 ? (
                <span className="text-emerald-400">already at target</span>
              ) : (
                <>
                  ready in <span className="text-emerald-400 font-mono">{monthsToTarget}</span> months ({eta(monthsToTarget)})
                </>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* What-if controls */}
      <Card className="bento-card">
        <CardHeader>
          <CardTitle className="text-lg">What-if scenarios</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SliderRow
            label="Monthly burn (essential expenses)"
            value={burn}
            min={0}
            max={Math.max(20000, defaultBurn * 3)}
            step={50}
            onChange={setBurn}
            displayValue={format(burn)}
          />
          <SliderRow
            label="Current cash earmarked for emergencies"
            value={cash}
            min={0}
            max={Math.max(500000, defaultCash * 3, target24 * 1.2)}
            step={500}
            onChange={setCash}
            displayValue={format(cash)}
          />
          <SliderRow
            label="Monthly savings into the fund"
            value={monthlySaving}
            min={0}
            max={Math.max(10000, defaultSavings * 3)}
            step={50}
            onChange={setMonthlySaving}
            displayValue={format(monthlySaving) + "/mo"}
          />
          <SliderRow
            label="APY on parked cash (HYSA / T-bills)"
            value={apy}
            min={0}
            max={10}
            step={0.05}
            onChange={setApy}
            displayValue={apy.toFixed(2) + "%"}
          />
          <div className="md:col-span-2 flex justify-end">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={() => {
                setBurn(defaultBurn);
                setCash(defaultCash);
                setMonthlySaving(defaultSavings);
                setApy(4.25);
              }}
            >
              Reset to live data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projection chart */}
      <Card className="bento-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-emerald-400" />
            36-month balance projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projection}>
                <defs>
                  <linearGradient id="emColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={50}
                />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                  formatter={(v: any) => [format(Number(v)), "Balance"]}
                />
                <ReferenceLine y={target24} stroke="#f43f5e" strokeDasharray="5 5" label={{ value: "24-mo target", fill: "#f43f5e", position: "insideTopRight", fontSize: 11 }} />
                <ReferenceLine y={burn * 6} stroke="#fbbf24" strokeDasharray="5 5" label={{ value: "6-mo baseline", fill: "#fbbf24", position: "insideTopRight", fontSize: 11 }} />
                <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fill="url(#emColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tier ladder */}
      <Card className="bento-card">
        <CardHeader>
          <CardTitle className="text-lg">The 5-Tier Ladder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {TIERS.map((t, i) => {
            const tierAmount = burn * t.months;
            const isMet = cash >= tierAmount;
            const Icon = t.icon;
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 transition-colors ${
                  isMet
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        isMet
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : `bg-${t.color}-500/10 border-${t.color}-500/30 text-${t.color}-300`
                      }`}
                    >
                      {isMet ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{t.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t.vehicle}</p>
                      <p className="text-xs text-slate-500 mt-1">{t.note}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">{t.months} mo</p>
                    <p className="text-lg font-bold text-white">{format(tierAmount)}</p>
                    {isMet ? (
                      <span className="text-[10px] font-bold text-emerald-400">FUNDED</span>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        need {format(tierAmount - cash)} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Playbook */}
      <Card className="bento-card border-emerald-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-emerald-300">
            <Sparkles className="h-5 w-5" />
            Your monthly playbook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-200 leading-relaxed">
          <Bullet n={1} text={`Automate ${format(monthlySaving)} on payday to a separate high-yield account labelled "Emergency – Do Not Touch".`} />
          <Bullet n={2} text="Keep Tier-1 (1 month of burn) in checking + HYSA so you can reach it within minutes." />
          <Bullet n={3} text="Move Tier-2 and Tier-3 layers into a HYSA paying ≥ 4% APY (or a 4-week Treasury auto-roll)." />
          <Bullet n={4} text="At Tier-4 and Tier-5, deploy a 3-6-12-month Treasury ladder so something is always maturing every quarter — never lock everything up at once." />
          <Bullet n={5} text="Re-test the plan whenever your monthly burn changes by more than 10% (e.g., new lease, new dependent, new loan)." />
          <Bullet n={6} text="Refill BEFORE investing in anything riskier. The emergency fund is the foundation under every other financial move you'll make." />
        </CardContent>
      </Card>

      {/* Warning banner if user is underwater */}
      {monthlySaving <= 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-rose-200 font-semibold">Your monthly cash flow is zero or negative.</p>
              <p className="text-sm text-rose-100/80 mt-1">
                You can't build an emergency fund out of money you don't have. Head to the{" "}
                <a href="/statement" className="underline hover:text-white">
                  Statement X-Ray
                </a>{" "}
                page to find drains, or refinance / consolidate the loans on your{" "}
                <a href="/liabilities" className="underline hover:text-white">
                  Liabilities
                </a>{" "}
                page to free up cash before starting this plan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  displayValue: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span>{label}</span>
        <span className="font-mono text-white">{displayValue}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

function Bullet({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <p>{text}</p>
    </div>
  );
}

function eta(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}
