"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { FileText, ExternalLink, Search, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
  const { data } = useFinancialData();
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Collect ALL documents from ALL assets into one list
  const allDocuments = [
    ...(data.assets.realEstate || []).flatMap(asset => 
      (asset.documents || []).map(doc => ({ ...doc, assetName: asset.name, type: "Real Estate" }))
    ),
    ...(data.assets.underDevelopment || []).flatMap(asset => 
      (asset.documents || []).map(doc => ({ ...doc, assetName: asset.name, type: "Under Development" }))
    )
  ];

  // 2. Filter based on search
  const filteredDocs = allDocuments.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.assetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-xl border-l-4 border-indigo-500 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Document Vault</h1>
          <p className="text-muted-foreground mt-1">Central repository for all asset contracts and files.</p>
        </div>
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search files..." 
                className="pl-9 bg-black/20 border-white/10 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length > 0 ? (
            filteredDocs.map((doc, index) => (
                <div key={`${doc.id}-${index}`} className="glass-panel p-4 rounded-xl border border-white/5 hover:border-indigo-500/50 transition-all group">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                                <FileText className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-semibold text-white truncate w-48" title={doc.name}>{doc.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <FolderOpen className="h-3 w-3" />
                                    <span className="truncate max-w-[150px]">{doc.assetName}</span>
                                </div>
                            </div>
                        </div>
                        <a href={doc.url} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </a>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                        <span>{doc.type}</span>
                        <span>{doc.uploadedAt || "Unknown Date"}</span>
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground border border-dashed border-white/10 rounded-xl bg-white/5">
                <FileText className="h-12 w-12 mb-4 opacity-20" />
                <p>No documents found.</p>
                <p className="text-sm">Go to the <b>Assets</b> page to upload contracts for your properties.</p>
            </div>
        )}
      </div>
    </div>
  );
}