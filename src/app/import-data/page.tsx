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

      const today = new Date().toISOString().split('T')[0];

      // --- HELPER ---
      const processProject = (name: string, developer: string, location: string, base: number, maint: number, schedule: any[]) => {
        const total = base + maint;
        const history: any[] = [];
        let paidSum = 0;
        let nextDate = "";
        let nextAmount = 0;

        schedule.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        schedule.forEach((p, index) => {
            if (p.date < today) {
                // Unique History ID
                history.push({ 
                    id: `pay_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`, 
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
        const randomSuffix = Math.floor(Math.random() * 1000000); 
        const uniqueId = `ast_${cleanName}_${randomSuffix}`;
        const uniqueLiabId = `liab_${cleanName}_${randomSuffix}`;

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
                notes: `Developer: ${developer}. Auto-Imported.`
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
                notes: "Imported schedule."
            }
        };
      };

      // ==========================================
      // PROJECT 1: Nile Admin (A4719)
      // ==========================================
      addLog("Processing Nile Admin...");
      // Total Price: 2,655,895 (Base ~2.4M)
      const adminSchedule = [
        { date: "2025-12-01", amount: 241500, desc: "Installment (Paid)" },
        { date: "2026-07-01", amount: 241500, desc: "Upcoming Installment" },
        { date: "2027-07-01", amount: 241500, desc: "Future Installment" },
        { date: "2028-07-01", amount: 241500, desc: "Future Installment" },
        { date: "2029-07-01", amount: 241060, desc: "Future Installment" },
        { date: "2030-07-01", amount: 241500, desc: "Final Installment" },
      ];
      // Approx Base: 2414450, Maint: 241445
      const objAdmin = processProject("Nile Admin (A4719)", "Nile Business City", "New Capital", 2414450, 241445, adminSchedule);

      // ==========================================
      // PROJECT 2: Nile Commercial (Co-A1050)
      // ==========================================
      addLog("Processing Nile Commercial...");
      // Total Price: 9,375,224
      const commSchedule = [
        { date: "2025-12-01", amount: 928240, desc: "Installment (Paid)" },
        { date: "2026-07-01", amount: 844700, desc: "Upcoming Installment" },
        { date: "2027-07-01", amount: 844700, desc: "Future Installment" },
        { date: "2028-07-01", amount: 844700, desc: "Future Installment" },
        { date: "2029-07-01", amount: 844700, desc: "Future Installment" },
        { date: "2030-07-01", amount: 844687, desc: "Final Installment" },
      ];
      const objComm = processProject("Nile Commercial (Co-A1050)", "Nile Business City", "New Capital", 9282400, 928240, commSchedule);

      // ==========================================
      // RE-IMPORT TYCOON (With Correct Name)
      // ==========================================
      addLog("Updating Tycoon Details...");
      // (Using your previous Tycoon schedules, just updating Developer Name)
      const tycoonDev = "Nile Business City - Grand Millennium";
      
      // H2203
      const h2203_Schedule = [
        { date: "2023-03-15", amount: 1002205, desc: "Downpayment" }, { date: "2023-09-01", amount: 820000, desc: "Installment 1" },
        { date: "2024-03-01", amount: 820000, desc: "Installment 2" }, { date: "2024-09-01", amount: 820000, desc: "Installment 3" },
        { date: "2025-03-01", amount: 820000, desc: "Installment 4" }, { date: "2025-09-01", amount: 820000, desc: "Installment 5" },
        { date: "2026-03-01", amount: 820000, desc: "Installment 6" }, { date: "2026-09-01", amount: 820000, desc: "Installment 7" },
        { date: "2027-02-01", amount: 1151960, desc: "Maintenance" }, { date: "2027-03-01", amount: 820000, desc: "Installment 8" },
        { date: "2027-09-01", amount: 820000, desc: "Installment 9" }, { date: "2028-03-01", amount: 820000, desc: "Installment 10" },
        { date: "2028-09-01", amount: 819847, desc: "Final" }
      ];
      const obj2203 = processProject("Tycoon H2203", tycoonDev, "New Capital", 10022052, 1151960, h2203_Schedule);

      // H2222
      const h2222_Schedule = [
        { date: "2023-03-15", amount: 948761, desc: "Downpayment" }, { date: "2023-09-01", amount: 776300, desc: "Installment 1" },
        { date: "2024-03-01", amount: 776300, desc: "Installment 2" }, { date: "2024-09-01", amount: 776300, desc: "Installment 3" },
        { date: "2025-03-01", amount: 776300, desc: "Installment 4" }, { date: "2025-09-01", amount: 776300, desc: "Installment 5" },
        { date: "2026-03-01", amount: 776300, desc: "Installment 6" }, { date: "2026-09-01", amount: 776300, desc: "Installment 7" },
        { date: "2027-02-01", amount: 1090530, desc: "Maintenance" }, { date: "2027-03-01", amount: 776300, desc: "Installment 8" },
        { date: "2027-09-01", amount: 776300, desc: "Installment 9" }, { date: "2028-03-01", amount: 776300, desc: "Installment 10" },
        { date: "2028-09-01", amount: 775850, desc: "Final" }
      ];
      const obj2222 = processProject("Tycoon H2222", tycoonDev, "New Capital", 9487611, 1090530, h2222_Schedule);

      // ==========================================
      // CLEANUP & SAVE
      // ==========================================
      // Remove old entries for these 4 projects
      const namesToRemove = ["Nile Admin", "Nile Commercial", "Tycoon H2203", "Tycoon H2222"];
      let cleanAssets = (assets.underDevelopment || []).filter((a: any) => !namesToRemove.some(n => a.name.includes(n)));
      let cleanLiabs = (liabilities.installments || []).filter((l: any) => !namesToRemove.some(n => l.project.includes(n)));

      // Add New
      cleanAssets.push(objAdmin.asset, objComm.asset, obj2203.asset, obj2222.asset);
      cleanLiabs.push(objAdmin.liability, objComm.liability, obj2203.liability, obj2222.liability);

      await setDoc(userRef, {
        ...currentData,
        assets: { ...currentData.assets, underDevelopment: cleanAssets },
        liabilities: { ...currentData.liabilities, installments: cleanLiabs }
      }, { merge: true });

      setStatus("success");
      addLog("SUCCESS: Nile Business City Projects Updated.");

    } catch (error: any) {
      console.error(error);
      setStatus("error");
      addLog(`ERROR: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white p-8 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        <h1 className="text-2xl font-bold text-center">Nile Business City Importer</h1>
        <div className="p-4 border border-white/10 rounded-lg bg-white/5 space-y-2 text-sm text-slate-300">
            <p className="font-bold text-blue-400">Importing Projects:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Nile Admin (A4719)</li>
                <li>Nile Commercial (Co-A1050)</li>
                <li>Tycoon H2203 & H2222 (Updated Name)</li>
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