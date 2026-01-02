"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Loader2, CheckCircle, Terminal } from "lucide-react";
import Link from "next/link";

export default function ImportDataPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState("idle");
  const [log, setLog] = useState<string[]>([]);

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

      // We assume today is Jan 2026 for simulation, or use real date
      const today = new Date().toISOString().split('T')[0];

      // --- HELPER ---
      const processProject = (name: string, developer: string, location: string, base: number, maint: number, schedule: any[]) => {
        const total = base + maint;
        const history: any[] = [];
        const fullSchedule: any[] = [];
        let paidSum = 0;
        let nextDate = "";
        let nextAmount = 0;

        schedule.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        schedule.forEach((p, index) => {
            // Add to Full Schedule List
            fullSchedule.push({
                id: `sch_${index}`,
                date: p.date,
                amount: p.amount,
                description: p.desc
            });

            if (p.date < today) {
                // Add to Paid History
                history.push({ 
                    id: `pay_${Date.now()}_${index}`, 
                    date: p.date, 
                    amount: p.amount, 
                    description: p.desc 
                });
                paidSum += p.amount;
            } else {
                if (!nextDate) {
                    nextDate = p.date;
                    nextAmount = p.amount;
                }
            }
        });

        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
        const uniqueId = `ast_${cleanName}`;
        const uniqueLiabId = `liab_${cleanName}`;

        return {
            asset: {
                id: uniqueId,
                name: name,
                location: location,
                purchasePrice: base,
                maintenanceCost: maint,
                parkingCost: 0,
                currentValue: total,
                currency: "EGP",
                linkedInstallmentId: uniqueLiabId,
                maintenanceDueDate: schedule.find((s: any) => s.desc.includes("Maintenance"))?.date || "",
                paymentFrequency: "Annual",
                documents: [],
                notes: `Developer: ${developer}. Imported Schedule.`
            },
            liability: {
                id: uniqueLiabId,
                project: name,
                developer: developer,
                total: total,
                paid: paidSum,
                amount: nextAmount,
                nextDueDate: nextDate,
                currency: "EGP",
                frequency: "Annual",
                paymentHistory: history,
                schedule: fullSchedule, // <--- NEW: SAVING FULL SCHEDULE
                notes: "Imported full schedule."
            }
        };
      };

      // ==========================================
      // PROJECT 1: Nile Admin (A4719)
      // ==========================================
      addLog("Processing Nile Admin...");
      const adminSchedule = [
        { date: "2025-12-01", amount: 241500, desc: "Installment (Paid)" }, // Paid
        { date: "2026-07-01", amount: 241500, desc: "Upcoming Installment" },
        { date: "2027-07-01", amount: 241500, desc: "Future Installment" },
        { date: "2028-07-01", amount: 241500, desc: "Future Installment" },
        { date: "2029-07-01", amount: 241060, desc: "Future Installment" },
        { date: "2030-07-01", amount: 241500, desc: "Final Installment" },
      ];
      // Note: Base approx 2.41M, Maint 241k (10%)
      const objAdmin = processProject("Nile Admin (A4719)", "Nile Business City", "New Capital", 2414450, 241445, adminSchedule);

      // ==========================================
      // PROJECT 2: Nile Commercial (Co-A1050)
      // ==========================================
      addLog("Processing Nile Commercial...");
      const commSchedule = [
        { date: "2025-12-01", amount: 928240, desc: "Installment (Paid)" }, // Paid
        { date: "2026-07-01", amount: 844700, desc: "Upcoming Installment" },
        { date: "2027-07-01", amount: 844700, desc: "Future Installment" },
        { date: "2028-07-01", amount: 844700, desc: "Future Installment" },
        { date: "2029-07-01", amount: 844700, desc: "Future Installment" },
        { date: "2030-07-01", amount: 844687, desc: "Final Installment" },
      ];
      // Note: Base approx 9.28M, Maint 928k
      const objComm = processProject("Nile Commercial (Co-A1050)", "Nile Business City", "New Capital", 9282400, 928240, commSchedule);

      // ==========================================
      // CLEANUP & SAVE
      // ==========================================
      // Remove old entries to prevent duplicates
      const namesToRemove = ["Nile Admin", "Nile Commercial"];
      let cleanAssets = (assets.underDevelopment || []).filter((a: any) => !namesToRemove.some(n => a.name.includes(n)));
      let cleanLiabs = (liabilities.installments || []).filter((l: any) => !l.project.includes("NURAI") && !l.project.includes("Dejoya") && !namesToRemove.some(n => l.project.includes(n)));

      // Note: Keeping Tycoon/Nurai/Dejoya if they exist, only replacing Nile
      // (If you want to replace Tycoon too, add it to namesToRemove and copy schedule from previous chat)

      cleanAssets.push(objAdmin.asset, objComm.asset);
      cleanLiabs.push(objAdmin.liability, objComm.liability);

      await setDoc(userRef, {
        ...currentData,
        assets: { ...currentData.assets, underDevelopment: cleanAssets },
        liabilities: { ...currentData.liabilities, installments: cleanLiabs }
      }, { merge: true });

      setStatus("success");
      addLog("SUCCESS: Nile Projects Updated.");

    } catch (error: any) {
      console.error(error);
      setStatus("error");
      addLog(`ERROR: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white p-8 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        <h1 className="text-2xl font-bold text-center">Nile Data Importer</h1>
        <div className="p-4 border border-white/10 rounded-lg bg-white/5 space-y-2 text-sm text-slate-300">
            <p className="font-bold text-blue-400">Importing Projects:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Nile Admin (A4719)</li>
                <li>Nile Commercial (Co-A1050)</li>
            </ul>
        </div>
        {status === 'idle' && <Button onClick={runImport} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12">Run Import</Button>}
        {status === 'loading' && <Button disabled className="w-full bg-blue-600/50 text-white h-12"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</Button>}
        {status === 'success' && <div className="space-y-4 text-center"><p className="text-emerald-400 font-bold">Success!</p><Link href="/"><Button variant="outline">Return to Dashboard</Button></Link></div>}
        <div className="mt-4 p-4 bg-black rounded-lg font-mono text-xs text-green-400 h-48 overflow-y-auto border border-white/10">{log.map((l, i) => <div key={i}>{`> ${l}`}</div>)}</div>
      </div>
    </div>
  );
}