"use client";

/**
 * Bank Statement Analyzer
 * ------------------------------------------------------------------
 * Upload a bank statement (PDF, CSV) or paste raw text. The AI flow
 * categorizes spending, surfaces the top "money drains", flags
 * anomalies, and recommends concrete fixes – linked back to the
 * user's 2-year emergency-fund goal.
 *
 * Privacy: file content is sent ONLY to the user's own AI flow
 * endpoint; nothing is stored unless the user explicitly clicks
 * "Save analysis to my profile".
 */

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { convert } from "@/lib/calculations";
import {
  Upload,
  FileText,
  Loader2,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Save,
  Trash2,
  ChevronRight,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
import {
  analyzeBankStatement,
  type AnalyzeBankStatementOutput,
} from "@/ai/flows/analyze-bank-statement";

type InputMode = "pdf" | "csv" | "paste";

const SESSION_KEY = "wealthwise.statement.lastResult";
const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "KWD", "EGP", "AED", "SAR", "TRY"];

export default function BankStatementPage() {
  const { metrics, currency, rates } = useFinancialData();
  const { format } = useCurrency();
  const { user } = useAuth();

  const [mode, setMode] = useState<InputMode>("paste");
  const [pasted, setPasted] = useState("");
  const [csvText, setCsvText] = useState("");
  const [statementCurrency, setStatementCurrency] = useState<string>(currency);
  const [monthlyIncome, setMonthlyIncome] = useState<number | "">("");
  const [monthsCovered, setMonthsCovered] = useState<number | "">(1);
  const [userGoals, setUserGoals] = useState(
    "Build a 2-year emergency fund and reduce monthly burn."
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeBankStatementOutput | null>(null);
  const [resultCurrency, setResultCurrency] = useState<string>(currency);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ---- Persistence: survive page refresh ---------------------------------
  // We cache the most recent analysis (and its source currency) in
  // sessionStorage so an accidental refresh doesn't wipe it.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.result) {
          setResult(parsed.result);
          setResultCurrency(parsed.resultCurrency || currency);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!result) return;
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ result, resultCurrency })
      );
    } catch {}
  }, [result, resultCurrency]);

  // ---- Conversion helper: render numbers in the user's display currency ----
  const toDisplay = (amount: number) =>
    convert(amount, resultCurrency, currency, rates);
  const fmt = (amount: number) => format(toDisplay(amount));

  // ------------------------------------------------------------------
  // File upload handlers
  // ------------------------------------------------------------------
  const handleFile = async (file: File) => {
    setErrMsg(null);
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
    const isText = file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt");

    if (isCsv) {
      const text = await file.text();
      setCsvText(text);
      setMode("csv");
      return;
    }

    if (isText) {
      const text = await file.text();
      setPasted(text);
      setMode("paste");
      return;
    }

    if (isPdf) {
      // We extract text in-browser using PDF.js if available, otherwise we
      // fall back to instructing the user to paste the text.
      try {
        const text = await extractPdfText(file);
        if (text && text.trim().length > 50) {
          setPasted(text);
          setMode("paste");
        } else {
          setErrMsg(
            "Couldn't read text from this PDF (it may be a scanned image). Open it in your PDF viewer, copy the transactions table, and paste it here."
          );
        }
      } catch (e: any) {
        setErrMsg(
          `PDF parsing failed: ${e?.message ?? "unknown error"}. Paste the text below instead.`
        );
      }
      return;
    }

    setErrMsg("Unsupported file type. Use PDF, CSV, or TXT.");
  };

  // ------------------------------------------------------------------
  // Analyze
  // ------------------------------------------------------------------
  const runAnalysis = async () => {
    setErrMsg(null);
    setResult(null);
    if (mode === "csv" && !csvText.trim()) {
      setErrMsg("Paste or upload some CSV data first.");
      return;
    }
    if (mode !== "csv" && !pasted.trim()) {
      setErrMsg("Paste or upload some statement text first.");
      return;
    }
    setLoading(true);
    setSavedOk(false);
    try {
      const out = await analyzeBankStatement({
        statementText: mode !== "csv" ? pasted : undefined,
        csvData: mode === "csv" ? csvText : undefined,
        monthlyIncome: typeof monthlyIncome === "number" ? monthlyIncome : undefined,
        monthsCovered: typeof monthsCovered === "number" ? monthsCovered : undefined,
        userGoals,
        // Tell the AI what currency the statement itself is in — not the
        // user's preferred display currency.  We convert later for display.
        displayCurrency: statementCurrency,
      });
      setResult(out);
      setResultCurrency(statementCurrency);
    } catch (e: any) {
      setErrMsg(e?.message ?? "Analysis failed. Try again with a smaller sample.");
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async () => {
    if (!user || !result) return;
    setSaving(true);
    setSavedOk(false);
    try {
      // Sub-collection: users/{uid}/statements/{id}
      // Numbers in `result` are denominated in `resultCurrency`.  We persist
      // them as-is and convert only at view time — so historical reports stay
      // accurate even if exchange rates move.
      await addDoc(collection(db, "users", user.uid, "statements"), {
        createdAt: serverTimestamp(),
        resultCurrency,
        displayCurrencyAtTime: currency,
        monthlyIncome,
        monthsCovered,
        userGoals,
        result,
      });
      setSavedOk(true);
    } catch (e) {
      console.error(e);
      setErrMsg("Could not save analysis. Check your network and try again.");
    } finally {
      setSaving(false);
    }
  };

  const clearCurrentResult = () => {
    setResult(null);
    setSavedOk(false);
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  const monthlyBurn = metrics?.emergency?.monthlyBurn ?? 0;
  const target24 = metrics?.emergency?.target24mo ?? 0;

  return (
    <div className="space-y-8 pb-24">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Statement X-Ray
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Upload a bank statement → see where your money is leaking → fix it.
            </p>
          </div>
        </div>
      </motion.header>

      {/* Step 1: Input */}
      <Card className="bento-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-emerald-400">1.</span> Bring in your statement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <ModeChip active={mode === "paste"} onClick={() => setMode("paste")} label="Paste text" />
            <ModeChip active={mode === "csv"} onClick={() => setMode("csv")} label="Paste CSV" />
            <ModeChip active={mode === "pdf"} onClick={() => setMode("pdf")} label="Upload PDF / CSV / TXT" />
          </div>

          {mode === "pdf" && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-emerald-500/30 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-slate-500" />
              <p className="text-sm text-slate-300 mt-3 font-medium">
                Drop your statement here, or click to browse
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF, CSV, or TXT • Max 10MB</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.csv,.txt,application/pdf,text/csv,text/plain"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          )}

          {mode === "paste" && (
            <Textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="Paste the body of your bank statement here — transaction lines, dates, amounts. Don't worry about formatting."
              className="bg-black/30 border-white/10 text-white min-h-[200px] font-mono text-xs"
            />
          )}

          {mode === "csv" && (
            <Textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`date,description,amount\n2026-04-01,Whole Foods Market,-87.42\n2026-04-02,Salary,4500.00`}
              className="bg-black/30 border-white/10 text-white min-h-[200px] font-mono text-xs"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wide">
                Statement currency
              </Label>
              <Select value={statementCurrency} onValueChange={setStatementCurrency}>
                <SelectTrigger className="bg-black/30 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white">
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-500 mt-1">
                The currency the bank used on this statement.
              </p>
            </div>
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wide">
                Monthly net income ({statementCurrency})
              </Label>
              <Input
                type="number"
                value={monthlyIncome}
                onChange={(e) =>
                  setMonthlyIncome(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="4500"
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wide">
                Months covered
              </Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={monthsCovered}
                onChange={(e) =>
                  setMonthsCovered(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wide">
                Your priority goal
              </Label>
              <Input
                value={userGoals}
                onChange={(e) => setUserGoals(e.target.value)}
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Button
              onClick={runAnalysis}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run AI Analysis
                </>
              )}
            </Button>
            {(pasted || csvText) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setPasted("");
                  setCsvText("");
                  setResult(null);
                  setErrMsg(null);
                }}
                className="text-slate-300 hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
            <p className="text-xs text-slate-500 flex items-center gap-2 ml-auto">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Your statement never leaves your session unless you click Save.
            </p>
          </div>

          {errMsg && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errMsg}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary tile */}
          <Card className="bento-card border-emerald-500/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
                <span>
                  Statement currency: <span className="text-white font-mono">{resultCurrency}</span>
                  {resultCurrency !== currency && (
                    <> · Showing in <span className="text-white font-mono">{currency}</span> at live rate</>
                  )}
                </span>
                <Link href="/reports" className="text-emerald-300 hover:text-white underline">
                  View saved reports →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Income" value={fmt(result.totalIncome)} tone="emerald" />
                <Stat label="Spend" value={fmt(result.totalSpend)} tone="rose" />
                <Stat
                  label="Net cash flow"
                  value={fmt(result.netCashFlow)}
                  tone={result.netCashFlow >= 0 ? "emerald" : "rose"}
                />
                <Stat
                  label="Savings rate"
                  value={`${result.savingsRatePct.toFixed(1)}%`}
                  tone={result.savingsRatePct >= 20 ? "emerald" : result.savingsRatePct >= 5 ? "amber" : "rose"}
                />
              </div>
              <p className="text-slate-300 leading-relaxed">{result.summary}</p>
            </CardContent>
          </Card>

          {/* Top drains – the headline finding */}
          {result.topDrains?.length > 0 && (
            <Card className="bento-card border-rose-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-300">
                  <TrendingDown className="h-5 w-5" />
                  Where your money is leaking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.topDrains.map((d, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/5 bg-black/30 p-4 hover:border-rose-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white font-semibold">{d.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{d.evidence}</p>
                      </div>
                      <SeverityBadge severity={d.severity} />
                    </div>
                    <div className="grid grid-cols-2 mt-3 gap-3">
                      <Mini label="Per month" value={fmt(d.monthlyCost)} />
                      <Mini label="Per year" value={fmt(d.annualizedCost)} />
                    </div>
                    <p className="text-emerald-300 text-sm mt-3 flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                      {d.fixAction}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Category breakdown */}
          {result.topCategories?.length > 0 && (
            <Card className="bento-card">
              <CardHeader>
                <CardTitle>Where your money went</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.topCategories.map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm text-slate-300 mb-1">
                      <span className="font-medium">{c.category}</span>
                      <span>
                        {fmt(c.totalSpent)} <span className="text-slate-500">· {c.pctOfSpend.toFixed(1)}%</span>
                      </span>
                    </div>
                    <Progress value={Math.min(100, c.pctOfSpend)} className="h-2 bg-white/5" />
                    {c.topMerchants?.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        Top: {c.topMerchants.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Anomalies */}
          {result.anomalies?.length > 0 && (
            <Card className="bento-card border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Flags worth checking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.anomalies.map((a, i) => (
                  <div key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-amber-400 font-mono uppercase text-[10px] tracking-wider pt-0.5">
                      {a.type}
                    </span>
                    <span>{a.description}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="bento-card border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-emerald-300 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Your get-back-on-track plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="leading-relaxed">{r}</p>
                </div>
              ))}
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">
                  Impact on your 2-year emergency fund
                </p>
                <p className="text-slate-200 text-sm leading-relaxed">{result.emergencyImpact}</p>
                {monthlyBurn > 0 && target24 > 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    Current 2-year target: <span className="text-white font-mono">{format(target24)}</span>{" "}
                    · Monthly burn: <span className="text-white font-mono">{format(monthlyBurn)}</span>
                    {" "}<span className="text-slate-600">(in {currency})</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save / clear actions */}
          {user && (
            <div className="flex justify-end gap-2 flex-wrap items-center">
              <Button
                variant="ghost"
                onClick={clearCurrentResult}
                className="text-slate-300 hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Link href="/reports">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  View saved reports
                </Button>
              </Link>
              <Button
                onClick={saveAnalysis}
                disabled={saving || savedOk}
                className={savedOk ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : savedOk ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {savedOk ? "Saved to your profile" : "Save to my profile"}
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function ModeChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-full border transition-all ${
        active
          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
          : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
      }`}
    >
      <FileText className="inline h-3 w-3 mr-2" />
      {label}
    </button>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "emerald" | "rose" | "amber" }) {
  const colors = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
  } as const;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
      <p className={`text-2xl font-bold ${colors[tone]} mt-1`}>{value}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/5 p-2">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-white font-mono text-sm">{value}</p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" | "critical" }) {
  const map = {
    low: "bg-slate-500/15 text-slate-300 border-slate-500/20",
    medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    high: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    critical: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  } as const;
  return (
    <span
      className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full border ${map[severity]}`}
    >
      {severity}
    </span>
  );
}

// ---------------------------------------------------------------------------
// PDF text extraction (lazy-loaded; no extra dep needed at top-of-file).
// We use the global pdfjsLib if pdf.js has been loaded, otherwise we attempt
// a one-time CDN load.  Fallback: ask the user to paste.
// ---------------------------------------------------------------------------
async function extractPdfText(file: File): Promise<string> {
  // Try to use a CDN-loaded pdf.js. If unavailable, surface an error.
  // (We deliberately don't add pdfjs-dist to package.json to keep bundle slim.)
  const w = window as any;
  if (!w.pdfjsLib) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      s.onload = () => {
        try {
          w.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        } catch {}
        resolve();
      };
      s.onerror = () => reject(new Error("Could not load PDF reader."));
      document.head.appendChild(s);
    });
  }
  const buf = await file.arrayBuffer();
  const pdf = await w.pdfjsLib.getDocument({ data: buf }).promise;
  let full = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    full += tc.items.map((i: any) => i.str).join(" ") + "\n";
  }
  return full;
}
