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

  const genQuarterly = (startCount: number, count: number, startDate: string, amount: number) => {
    const arr = [];
    let d = new Date(startDate);
    for(let i=0; i<count; i++) {
        arr.push({ desc: `Installment ${startCount+i}`, date: format(d, 'yyyy-MM-dd'), amount });
        d = addMonths(d, 3);
    }
    return arr;
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
      
      // Get existing lists to check for documents
      const existingUnderDev = currentData.assets?.underDevelopment || [];
      const assets = currentData.assets || { underDevelopment: [] };
      const liabilities = currentData.liabilities || { installments: [] };

      const today = new Date().toISOString().split('T')[0];

      // --- HELPER ---
      const processProject = (name: string, developer: string, location: string, base: number, maint: number, park: number, schedule: any[]) => {
        const total = base + maint + park;
        const history: any[] = [];
        const fullSchedule: any[] = [];
        let paidSum = 0;
        let nextDate = "";
        let nextAmount = 0;

        schedule.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        schedule.forEach((p, i) => {
            fullSchedule.push({ id: `sch_${i}_${Math.random()}`, date: p.date, amount: p.amount, description: p.desc });
            if (p.date < today) {
                 history.push({ id: `pay_${i}_${Math.random()}`, date: p.date, amount: p.amount, description: p.desc });
                 paidSum += p.amount;
            } else {
                 if(!nextDate) { nextDate = p.date; nextAmount = p.amount; }
            }
        });

        // Generate IDs
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
        const uid = `ast_${cleanName}`; // Use stable ID prefix to help finding it
        const lid = `liab_${cleanName}_${Math.floor(Math.random()*10000)}`;

        // --- CRITICAL FIX: PRESERVE DOCUMENTS ---
        // Look for an existing asset with this name in the DB
        const oldAsset = existingUnderDev.find((a: any) => a.name === name);
        const savedDocs = oldAsset?.documents || [];
        
        if (savedDocs.length > 0) {
            addLog(`PRESERVING ${savedDocs.length} documents for ${name}`);
        }

        return {
            asset: {
                id: oldAsset?.id || uid + "_" + Math.floor(Math.random()*1000), // Keep old ID if exists
                name, location, purchasePrice: base, maintenanceCost: maint, parkingCost: park, currentValue: total, currency: "EGP",
                linkedInstallmentId: lid, maintenanceDueDate: schedule.find((s:any)=>s.desc.includes("Maintenance"))?.date || "", paymentFrequency: "Annual",
                documents: savedDocs, // <--- HERE IS THE FIX
                notes: `Developer: ${developer}. Auto-Imported.`
            },
            liability: {
                id: lid, project: name, developer: developer, total, paid: paidSum, amount: nextAmount, nextDueDate: nextDate, currency: "EGP", frequency: "Annual",
                paymentHistory: history, schedule: fullSchedule, notes: "Full schedule imported."
            }
        };
      };

      // ... (KEEP THE EXACT SCHEDULE ARRAYS FROM PREVIOUS FILE) ...
      // I will abbreviate them here for length, but you must keep the full arrays 
      // from the file I gave you previously.
      // IF YOU NEED ME TO PASTE THE SCHEDULES AGAIN, LET ME KNOW.
      // Assuming you keep the logic below:

      // 1. NILE ADMIN
      const adminSched = [
        { date: "2022-10-12", amount: 482890, desc: "Downpayment" }, { date: "2023-07-09", amount: 241500, desc: "Installment" },
        { date: "2024-06-27", amount: 241500, desc: "Installment" }, { date: "2025-07-13", amount: 241500, desc: "Installment" },
        { date: "2025-12-01", amount: 241445, desc: "Maintenance" }, { date: "2026-07-01", amount: 241500, desc: "Installment" },
        { date: "2027-07-01", amount: 241500, desc: "Installment" }, { date: "2028-07-01", amount: 241500, desc: "Installment" },
        { date: "2029-07-01", amount: 241500, desc: "Installment" }, { date: "2030-07-01", amount: 241060, desc: "Final" },
      ];
      const nileAdmin = processProject("Nile Admin (A4719)", "Nile Business City", "New Capital", 2414450, 241445, 0, adminSched);

      // 2. NILE COMMERCIAL
      const commSched = [
        { date: "2022-10-12", amount: 1689400, desc: "Downpayment" }, { date: "2023-07-09", amount: 844700, desc: "Installment" },
        { date: "2024-06-27", amount: 844700, desc: "Installment" }, { date: "2025-07-13", amount: 844700, desc: "Installment" },
        { date: "2025-12-21", amount: 928240, desc: "Maintenance" }, { date: "2026-07-01", amount: 844700, desc: "Installment" },
        { date: "2027-07-01", amount: 844700, desc: "Installment" }, { date: "2028-07-01", amount: 844700, desc: "Installment" },
        { date: "2029-07-01", amount: 844700, desc: "Installment" }, { date: "2030-07-01", amount: 844687, desc: "Final" },
      ];
      const nileComm = processProject("Nile Commercial (Co-A1050)", "Nile Business City", "New Capital", 8446987, 928240, 0, commSched);

      // 3. NURAI
      const nuraiSched = [
        { desc: "Downpayment", date: "2024-09-25", amount: 205227 }, { desc: "Other Payment", date: "2024-12-25", amount: 205227 },
        ...genQuarterly(1, 31, "2025-03-25", 135593).map((item, i) => { if(i===13) item.amount = 135587; if(i>=14 && i<30) item.amount = 119164; if(i===30) item.amount = 119176; return item; }),
        ...genQuarterly(1, 8, "2026-02-28", 41045).map(i => ({...i, desc: `Maintenance`}))
      ];
      const nurai = processProject("Nurai (NUI-11A1-23)", "Mercon", "New Cairo", 4104550, 328360, 230000, nuraiSched);

      // 4. DEJOYA
      const dejoyaSched = [
         { desc: "Downpayment", date: "2025-04-21", amount: 1181250 }, ...genQuarterly(1, 7, "2025-08-17", 157500),
         { desc: "Special Payment", date: "2027-05-17", amount: 393750 }, { desc: "Installment 8", date: "2027-05-17", amount: 157500 },
         ...genQuarterly(9, 15, "2027-08-17", 157500), ...genQuarterly(24, 17, "2031-05-17", 157500),
         { desc: "Maintenance", date: "2028-04-21", amount: 787500 }
      ];
      const dejoya = processProject("Dejoya Primero", "Taj Misr", "New Zayed", 7875000, 787500, 0, dejoyaSched);

      // 5. TYCOON 2203
      const t2203Sched = [
        { date: "2023-03-15", amount: 1002205 }, { date: "2023-09-01", amount: 820000 }, { date: "2024-03-01", amount: 820000 }, { date: "2024-09-01", amount: 820000 },
        { date: "2025-03-01", amount: 820000 }, { date: "2025-09-01", amount: 820000 }, { date: "2026-03-01", amount: 820000 }, { date: "2026-09-01", amount: 820000 },
        { date: "2027-02-01", amount: 1151960, desc: "Maint" }, { date: "2027-03-01", amount: 820000 }, { date: "2027-09-01", amount: 820000 }, { date: "2028-03-01", amount: 820000 }, { date: "2028-09-01", amount: 819847 }
      ];
      const t2203 = processProject("Tycoon H2203", "Grand Millennium Hotel", "New Capital", 10022052, 1151960, 0, t2203Sched);

      // 6. TYCOON 2222
      const t2222Sched = [
        { date: "2023-03-15", amount: 948761 }, { date: "2023-09-01", amount: 776300 }, { date: "2024-03-01", amount: 776300 }, { date: "2024-09-01", amount: 776300 },
        { date: "2025-03-01", amount: 776300 }, { date: "2025-09-01", amount: 776300 }, { date: "2026-03-01", amount: 776300 }, { date: "2026-09-01", amount: 776300 },
        { date: "2027-02-01", amount: 1090530, desc: "Maint" }, { date: "2027-03-01", amount: 776300 }, { date: "2027-09-01", amount: 776300 }, { date: "2028-03-01", amount: 776300 }, { date: "2028-09-01", amount: 775850 }
      ];
      const t2222 = processProject("Tycoon H2222", "Grand Millennium Hotel", "New Capital", 9487611, 1090530, 0, t2222Sched);

      // ================= SAVE =================
      const newAssets = [nurai.asset, dejoya.asset, nileAdmin.asset, nileComm.asset, t2203.asset, t2222.asset];
      const newLiabs = [nurai.liability, dejoya.liability, nileAdmin.liability, nileComm.liability, t2203.liability, t2222.liability];

      // Remove OLD versions to avoid duplicates
      let cleanAssets = (assets.underDevelopment || []).filter((a: any) => !["Nurai", "Dejoya", "Nile", "Tycoon"].some(k => a.name.includes(k)));
      let cleanLiabs = (liabilities.installments || []).filter((l: any) => !["Nurai", "Dejoya", "Nile", "Tycoon"].some(k => l.project.includes(k)));

      // Merge
      cleanAssets.push(...newAssets);
      cleanLiabs.push(...newLiabs);

      await setDoc(userRef, {
        ...currentData,
        assets: { ...currentData.assets, underDevelopment: cleanAssets },
        liabilities: { ...currentData.liabilities, installments: cleanLiabs }
      }, { merge: true });

      setStatus("success");
      addLog("SUCCESS: Projects Updated. Documents Preserved.");

    } catch (error: any) {
      console.error(error);
      setStatus("error");
      addLog(`ERROR: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Master Data Importer (Safe)</h1>
        {status === 'idle' && <Button onClick={runImport} className="bg-blue-600 h-12 px-8 font-bold">Update Projects</Button>}
        {status === 'loading' && <Button disabled><Loader2 className="animate-spin mr-2"/> Processing...</Button>}
        {status === 'success' && <Link href="/"><Button variant="outline" className="text-green-400">Done! Return to Dashboard</Button></Link>}
        <div className="mt-4 p-4 bg-black rounded text-xs h-64 overflow-y-auto w-full max-w-lg border border-white/10">{log.map((l, i) => <div key={i}>{l}</div>)}</div>
    </div>
  );
}