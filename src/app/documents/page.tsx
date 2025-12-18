"use client";

import { useState } from "react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { FileText, ExternalLink, Search, FolderOpen, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
  const { data } = useFinancialData();
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Flatten all documents into one searchable list
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

  // 3. GROUP BY ASSET NAME (The key change)
  const groupedDocs = filteredDocs.reduce((groups, doc) => {
    if (!groups[doc.assetName]) {
        groups[doc.assetName] = [];
    }
    groups[doc.assetName].push(doc);
    return groups;
  }, {} as Record<string, typeof filteredDocs>);

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

      {/* --- GROUPED DOCUMENTS --- */}
      <div className="space-y-8">
        {Object.keys(groupedDocs).length > 0 ? (
            Object.entries(groupedDocs).map(([assetName, docs]) => (
                <div key={assetName} className="space-y-4">
                    {/* Asset Header */}
                    <div className="flex items-center gap-2 text-xl font-semibold text-indigo-300 border-b border-white/5 pb-2">
                        <FolderOpen className="h-5 w-5" />
                        {assetName}
                    </div>

                    {/* Grid for this Asset */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {docs.map((doc, index) => (
                            <div key={`${doc.id}-${index}`} className="glass-panel p-4 rounded-xl border border-white/5 hover:border-indigo-500/50 transition-all group bg-black/20">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                                            <FileText className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-semibold text-white truncate w-40" title={doc.name}>{doc.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">{doc.uploadedAt || "Unknown Date"}</p>
                                        </div>
                                    </div>
                                    <a href={doc.url} target="_blank" rel="noreferrer">
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground border border-dashed border-white/10 rounded-xl bg-white/5">
                <FileText className="h-12 w-12 mb-4 opacity-20" />
                <p>No documents found matching your search.</p>
            </div>
        )}
      </div>
    </div>
  );
}