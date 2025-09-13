
"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import type { Currency, FinancialData, HistoryEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Upload, Download, Save } from "lucide-react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { calculateMetrics } from "@/lib/calculations";

const pageTitles: { [key: string]: string } = {
  "/": "Dashboard",
  "/assets": "Asset Tracking",
  "/liabilities": "Liability Tracking",
  "/cashflow": "Cash Flow Management",
  "/advisor": "AI Financial Advisor",
  "/insights": "AI Document Insights",
  "/calculator": "Currency Calculator",
  "/breakdown": "Calculation Breakdown",
  "/health": "Financial Health Analysis",
  "/trends": "Financial Trends",
};

export function AppHeader() {
  const pathname = usePathname();
  const { currency } = useCurrency();
  const { setCurrency } = useCurrency();
  const { data, setData } = useFinancialData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const title = pageTitles[pathname] || "Wealth Navigator";

  const handleExport = () => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wealth-navigator-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Data Exported",
      description: "Your financial data has been saved to your downloads.",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
            throw new Error("File is not valid text");
        }
        const importedData = JSON.parse(text);
        
        if (!importedData.history) {
          importedData.history = [];
        }

        setData(importedData as FinancialData);
        toast({
          title: "Import Successful",
          description: "Your financial data has been loaded.",
        });
      } catch (error) {
        console.error("Failed to import data:", error);
        toast({
          title: "Import Failed",
          description: "The selected file is not valid JSON.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleSaveSnapshot = () => {
    const metrics = calculateMetrics(data, currency);
    const newSnapshot: HistoryEntry = {
      date: new Date().toISOString(),
      netWorth: metrics.netWorth,
      totalAssets: metrics.totalAssets,
      totalLiabilities: metrics.totalLiabilities,
      netCashFlow: metrics.netCashFlow,
    };

    const updatedData = {
      ...data,
      history: [...(data.history || []), newSnapshot]
    };
    setData(updatedData);

    toast({
      title: "Snapshot Saved",
      description: `Financial snapshot for ${new Date().toLocaleDateString()} has been saved.`,
    });
  };


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileImport}
          accept="application/json"
        />
        <Button variant="outline" size="sm" onClick={handleSaveSnapshot}>
          <Save className="mr-2 h-4 w-4" />
          Save Snapshot
        </Button>
        <Button variant="outline" size="sm" onClick={handleImportClick}>
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
         <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EGP">EGP</SelectItem>
            <SelectItem value="KWD">KWD</SelectItem>
            <SelectItem value="TRY">TRY</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
