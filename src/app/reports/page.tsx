"use client";

/**
 * Saved Reports
 * --------------------------------------------------------------
 * Lists every analysis the user clicked "Save to my profile" on,
 * stored under  users/{uid}/statements/*.  Each row is expandable
 * to show the full detail and includes a delete button.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { convert } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FolderOpen,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  AlertTriangle,
  Loader2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import type { AnalyzeBankStatementOutput } from "@/ai/flows/analyze-bank-statement";

interface SavedReport {
  id: string;
  createdAt: any;
  resultCurrency: string;
  displayCurrencyAtTime?: string;
  monthlyIncome?: number | "";
  monthsCovered?: number | "";
  userGoals?: string;
  result: AnalyzeBankStatementOutput;
}

export default function SavedReportsPage() {
  const { user } = useAuth();
  const { currency, rates } = useFinancialData();
  const { format } = useCurrency();

  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "users", user.uid, "statements"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setReports(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );
        setLoading(false);
      },
      (err) => {
        console.error("Saved reports error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("Delete this saved report? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "users", user.uid, "statements", id));
    } catch (e) {
      console.error(e);
      alert("Could not delete. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Convert numbers from a report's stored currency into the active display currency.
  const fmtFor = (amount: number, fromCurrency: string) =>
    format(convert(amount, fromCurrency, currency, rates));

  return (
    <div className="space-y-8 pb-24">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end gap-4 justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Saved Reports
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Every Statement X-Ray you saved, in one place. Values shown in {currency}.
            </p>
          </div>
        </div>
        <Link href="/statement">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Run a new X-Ray
          </Button>
        </Link>
      </motion.header>

      {!user && (
        <Card className="bento-card">
          <CardContent className="p-6 text-center text-slate-400">
            Sign in to view your saved reports.
          </CardContent>
        </Card>
      )}

      {user && loading && (
        <Card className="bento-card">
          <CardContent className="p-12 flex items-center justify-center gap-3 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your saved reports…
          </CardContent>
        </Card>
      )}

      {user && !loading && reports.length === 0 && (
        <Card className="bento-card border-white/5">
          <CardContent className="p-12 text-center space-y-3">
            <FolderOpen className="h-10 w-10 mx-auto text-slate-500" />
            <p className="text-slate-300">No saved reports yet.</p>
            <p className="text-xs text-slate-500">
              Run a Statement X-Ray and click <span className="text-white">Save to my profile</span> to keep it.
            </p>
          </CardContent>
        </Card>
      )}

      {user && !loading && reports.length > 0 && (
        <div className="space-y-3">
          {reports.map((r) => {
            const isOpen = expanded === r.id;
            const sourceCur = r.resultCurrency || "USD";
            const created =
              r.createdAt?.toDate?.()?.toLocaleString?.() || "—";
            const topDrain = r.result.topDrains?.[0];
            return (
              <Card key={r.id} className="bento-card border-white/10 hover:border-emerald-500/20 transition-colors">
                <CardContent className="p-5">
                  <div
                    className="flex items-start justify-between gap-3 cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span>{created}</span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-slate-300">{sourceCur}</span>
                        {sourceCur !== currency && (
                          <>
                            <span className="text-slate-600">→</span>
                            <span className="font-mono text-slate-300">{currency}</span>
                          </>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        <Mini label="Income" value={fmtFor(r.result.totalIncome, sourceCur)} tone="emerald" />
                        <Mini label="Spend" value={fmtFor(r.result.totalSpend, sourceCur)} tone="rose" />
                        <Mini
                          label="Net"
                          value={fmtFor(r.result.netCashFlow, sourceCur)}
                          tone={r.result.netCashFlow >= 0 ? "emerald" : "rose"}
                        />
                        <Mini
                          label="Savings rate"
                          value={`${(r.result.savingsRatePct || 0).toFixed(1)}%`}
                          tone={r.result.savingsRatePct >= 20 ? "emerald" : r.result.savingsRatePct >= 5 ? "amber" : "rose"}
                        />
                      </div>
                      {topDrain && !isOpen && (
                        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                          <TrendingDown className="h-3 w-3 text-rose-400" />
                          Top drain: <span className="text-rose-300 font-medium">{topDrain.label}</span>
                          <span className="text-slate-600">·</span>
                          <span className="font-mono">{fmtFor(topDrain.annualizedCost, sourceCur)}/yr</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(r.id);
                        }}
                        disabled={deletingId === r.id}
                        className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        title="Delete"
                      >
                        {deletingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-400">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-5 pt-5 border-t border-white/5 space-y-5">
                      <p className="text-slate-200 leading-relaxed">{r.result.summary}</p>

                      {/* Drains */}
                      {r.result.topDrains?.length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-rose-300 font-bold mb-2 flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" /> Money drains
                          </p>
                          <div className="space-y-2">
                            {r.result.topDrains.map((d, i) => (
                              <div key={i} className="rounded-lg border border-white/5 bg-black/20 p-3">
                                <div className="flex justify-between gap-2">
                                  <p className="text-white text-sm font-medium">{d.label}</p>
                                  <span className="text-xs font-mono text-rose-300">
                                    {fmtFor(d.annualizedCost, sourceCur)}/yr
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{d.evidence}</p>
                                <p className="text-emerald-300 text-xs mt-2">→ {d.fixAction}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Categories */}
                      {r.result.topCategories?.length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
                            Where the money went
                          </p>
                          <div className="space-y-2">
                            {r.result.topCategories.map((c, i) => (
                              <div key={i}>
                                <div className="flex justify-between text-sm text-slate-300">
                                  <span>{c.category}</span>
                                  <span className="font-mono">
                                    {fmtFor(c.totalSpent, sourceCur)} <span className="text-slate-500">· {c.pctOfSpend?.toFixed(1)}%</span>
                                  </span>
                                </div>
                                <Progress value={Math.min(100, c.pctOfSpend || 0)} className="h-1.5 bg-white/5 mt-1" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Anomalies */}
                      {r.result.anomalies?.length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Flags
                          </p>
                          <ul className="space-y-1 text-sm text-slate-300">
                            {r.result.anomalies.map((a, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="font-mono uppercase text-[10px] tracking-widest text-amber-400 pt-0.5">
                                  {a.type}
                                </span>
                                <span>{a.description}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {r.result.recommendations?.length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Plan
                          </p>
                          <ol className="space-y-1 text-sm text-slate-200 list-decimal list-inside">
                            {r.result.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {r.result.emergencyImpact && (
                        <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                          <p className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold">
                            Impact on 2-year emergency fund
                          </p>
                          <p className="text-slate-200 text-sm mt-1">{r.result.emergencyImpact}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "amber";
}) {
  const tones = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    amber: "text-amber-300",
  } as const;
  return (
    <div className="rounded-lg bg-white/5 border border-white/5 p-2">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`${tones[tone]} font-semibold text-sm mt-0.5 font-mono`}>{value}</p>
    </div>
  );
}
