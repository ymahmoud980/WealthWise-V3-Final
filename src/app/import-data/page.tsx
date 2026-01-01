"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Loader2, CheckCircle, Terminal } from "lucide-react";
import Link from "next/link";
import { addMonths, format } from "date-fns";

export default function ImportDataPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState("idle");
  const [log, setLog] = useState<string[]>([]);

  // --- HELPER: Generate Quarterly Installments ---
  const generateQuarterly = (startCount: number, count: number, startDate: string, amount: number) => {
    const installments = [];
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < count; i++) {
        installments.push({
            desc: `Installment ${startCount + i}`,
            date: format(currentDate, 'yyyy-MM-dd'),
            amount: amount
        });
        currentDate = addMonths(currentDate, 3); // Add 3 months
    }
    return installments;
  };

  const runImport = async () => {
    if (!user) return alert("Please log in first");
    setStatus("loading");
    setLog([]);
    const addLog = (msg: string) => setLog(prev => [...prev, msg]);

    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};
      const assets = currentData.assets || { underDevelopment: [] };
      const liabilities = currentData.liabilities || { installments: [] };

      // ==========================================
      // PROJECT 1: MERCON NURAI
      // ==========================================
      addLog("Processing NURAI...");
      
      const nuraiBase = 4104550;
      const nuraiPark = 230000;
      const nuraiMaint = 328360;
      const nuraiTotal = nuraiBase + nuraiPark + nuraiMaint;

      // Nurai Schedule
      const nuraiSchedule = [
        { desc: "Downpayment", date: "2024-09-25", amount: 205227 },
        { desc: "Other Payment", date: "2024-12-25", amount: 205227 },
        // Generated 1-31 (Simplified for brevity, logic handles full list)
        ...generateQuarterly(1, 31, "2025-03-25", 135593).map((item, i) => {
            // Adjust specific installment amounts based on your sheet
            if(i === 13) return { ...item, amount: 135587 }; // Inst 14
            if(i >= 14 && i < 30) return { ...item, amount: 119164 }; // Inst 15-30
            if(i === 30) return { ...item, amount: 119176 }; // Inst 31
            return item;
        }),
        // Maintenance 
        ...generateQuarterly(1, 8, "2026-02-28", 41045).map(i => ({...i, desc: `Maintenance ${i.desc.split(' ')[1]}`}))
      ].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


      // ==========================================
      // PROJECT 2: TAJ MISR - DEJOYA PRIMERO
      // ==========================================
      addLog("Processing DEJOYA PRIMERO...");

      const tajBase = 7875000;
      const tajMaint = 787500; // 10%
      const tajTotal = 8662500;

      // Taj Schedule Construction
      const tajSchedule = [
        { desc: "Downpayment", date: "2025-04-21", amount: 1181250 },
        { desc: "Installment 1", date: "2025-08-17", amount: 157500 },
        { desc: "Installment 2", date: "2025-11-17", amount: 157500 },
        { desc: "Installment 3", date: "2026-02-17", amount: 157500 },
        { desc: "Installment 4", date: "2026-05-17", amount: 157500 },
        { desc: "Installment 5", date: "2026-08-17", amount: 157500 },
        { desc: "Installment 6", date: "2026-11-17", amount: 157500 },
        { desc: "Installment 7", date: "2027-02-17", amount: 157500 },
        { desc: "Special Payment", date: "2027-05-17", amount: 393750 },
        { desc: "Installment 8", date: "2027-05-17", amount: 157500 },
        // Installments 9 - 23 (15 payments starting Aug 2027)
        ...generateQuarterly(9, 15, "2027-08-17", 157500),
        // Installments 24 - 40 (17 payments starting May 2031)
        ...generateQuarterly(24, 17, "2031-05-17", 157500),
        // Maintenance Payment (Single Shot)
        { desc: "Maintenance", date: "2028-04-21", amount: 787500 }
      ].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


      // ==========================================
      // UNIVERSAL PROCESSING LOGIC
      // ==========================================
      const today = new Date().toISOString().split('T')[0]; // "2026-01-01"

      const processProject = (name: string, location: string, base: number, maint: number, park: number, total: number, schedule: any[]) => {
        const history: any[] = [];
        let paidSum = 0;
        let nextDate = "";
        let nextAmount = 0;

        schedule.forEach(p => {
            if (p.date < today) {
                history.push({ id: `hist_${p.date}_${p.amount}`, date: p.date, amount: p.amount, description: p.desc });
                paidSum += p.amount;
            } else if (!nextDate) {
                nextDate = p.date;
                nextAmount = p.amount;
            }
        });

        return {
            asset: {
                id: `ast_${name.substring(0,3)}_${Date.now()}`,
                name: name,
                location: location,
                purchasePrice: base,
                maintenanceCost: maint,
                parkingCost: park,
                currentValue: total,
                currency: "EGP",
                linkedInstallmentId: `liab_${name.substring(0,3)}`,
                maintenanceDueDate: schedule.find((s: any) => s.desc.includes("Maintenance"))?.date || "",
                paymentFrequency: "Quarterly",
                documents: [],
                notes: `Auto-Imported. Base: ${base.toLocaleString()}, Maint: ${maint.toLocaleString()}`
            },
            liability: {
                id: `liab_${name.substring(0,3)}`,
                project: name,
                developer: location, // Using location as developer for now
                total: total,
                paid: paidSum,
                amount: nextAmount,
                nextDueDate: nextDate,
                currency: "EGP",
                frequency: "Quarterly",
                paymentHistory: history,
                notes: "Full schedule imported."
            }
        };
      };

      // Generate Objects
      const nuraiObj = processProject("NURAI (NUI-11A1-23)", "Mercon", nuraiBase, nuraiMaint, nuraiPark, nuraiTotal, nuraiSchedule);
      const tajObj = processProject("Dejoya Primero (S1/S-24)", "Taj Misr - New Zayed", tajBase, tajMaint, 0, tajTotal, tajSchedule);

      // Filter out old versions of these specific projects to avoid dupes
      let cleanAssets = (assets.underDevelopment || []).filter((a: any) => !a.name.includes("NURAI") && !a.name.includes("Dejoya"));
      let cleanLiabs = (liabilities.installments || []).filter((l: any) => !l.project.includes("NURAI") && !l.project.includes("Dejoya"));

      // Push New
      cleanAssets.push(nuraiObj.asset, tajObj.asset);
      cleanLiabs.push(nuraiObj.liability, tajObj.liability);

      // Save
      await setDoc(userRef, {
        ...currentData,
        assets: { ...currentData.assets, underDevelopment: cleanAssets },
        liabilities: { ...currentData.liabilities, installments: cleanLiabs }
      }, { merge: true });

      setStatus("success");
      addLog("SUCCESS: Nurai and Dejoya imported.");
      addLog(`Dejoya Status: Paid ${tajObj.liability.paid.toLocaleString()} / Next Due: ${tajObj.liability.nextDueDate}`);

    } catch (error: any) {
      console.error(error);
      setStatus("error");
      addLog(`ERROR: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white p-8 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        <h1 className="text-2xl font-bold text-center">Master Data Importer</h1>
        <div className="p-4 border border-white/10 rounded-lg bg-white/5 space-y-2 text-sm text-slate-300">
            <p className="font-bold text-emerald-400">Projects to Import:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Mercon Nurai:</strong> 4.3M EGP (Cityscape Offer)</li>
                <li><strong>Taj Misr Dejoya:</strong> 8.6M EGP (New Zayed)</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
                * Calculates paid amounts based on Date: {new Date().toLocaleDateString()}
            </p>
        </div>

        {status === 'idle' && (
            <Button onClick={runImport} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12">
                Run Multi-Project Import
            </Button>
        )}

        {status === 'loading' && (
            <Button disabled className="w-full bg-blue-600/50 text-white h-12">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Data...
            </Button>
        )}

        {status === 'success' && (
            <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400">
                    <CheckCircle className="h-6 w-6" />
                    <div>
                        <p className="font-bold">Database Updated Successfully</p>
                    </div>
                </div>
                <Link href="/">
                    <Button variant="outline" className="w-full border-white/10">Go to Dashboard</Button>
                </Link>
            </div>
        )}

        <div className="mt-4 p-4 bg-black rounded-lg font-mono text-xs text-green-400 h-64 overflow-y-auto border border-white/10">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2 text-white">
                <Terminal className="h-4 w-4" /> Import Log
            </div>
            {log.map((l, i) => <div key={i} className="mb-1">{`> ${l}`}</div>)}
        </div>
      </div>
    </div>
  );
}