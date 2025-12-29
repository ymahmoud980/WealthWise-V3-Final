"use client";

import { useState } from "react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Trash2, Search, Building2, Package, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { storage } from "@/lib/firebase";
import { ref, deleteObject } from "firebase/storage";

export default function DocumentsPage() {
  const { data, setData } = useFinancialData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Group Documents by Asset Name
  const groupedDocs: Record<string, { type: string, docs: any[], assetId: string }> = {};

  const processList = (list: any[], type: string) => {
    list.forEach(asset => {
        if (asset.documents && asset.documents.length > 0) {
            // Filter by search term immediately
            const matchingDocs = asset.documents.filter((d: any) => 
                d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                asset.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (matchingDocs.length > 0) {
                groupedDocs[asset.name] = {
                    type: type,
                    assetId: asset.id,
                    docs: matchingDocs.map((d: any) => ({ ...d, assetId: asset.id, assetType: type, assetName: asset.name }))
                };
            }
        }
    });
  };

  processList(data.assets.realEstate || [], "Real Estate");
  processList(data.assets.underDevelopment || [], "Off-Plan");

  // 2. Delete Logic
  const handleDelete = async (doc: any) => {
    if(!confirm(`Delete ${doc.name}?`)) return;
    
    try {
        // Delete from Cloud
        try {
            await deleteObject(ref(storage, `assets/${user?.uid}/${doc.assetId}/${doc.name}`));
        } catch(e) {}

        // Delete from Data
        const updatedData = JSON.parse(JSON.stringify(data));
        const list = doc.assetType === "Real Estate" ? updatedData.assets.realEstate : updatedData.assets.underDevelopment;
        const asset = list.find((a: any) => a.id === doc.assetId);
        
        if (asset && asset.documents) {
            asset.documents = asset.documents.filter((d: any) => d.name !== doc.name);
            setData(updatedData);
        }
    } catch(err) { alert("Failed to delete."); }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Document Vault</h1>
                <p className="text-muted-foreground">Organized by Asset & Project.</p>
            </div>
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search files or assets..." 
                    className="pl-9 bg-[#111827] border-white/10 text-white focus:ring-primary"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Groups */}
        <div className="space-y-10">
            {Object.entries(groupedDocs).map(([assetName, group]) => (
                <div key={assetName} className="space-y-4">
                    {/* Asset Header */}
                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-200">
                        <div className={`p-2 rounded-lg ${group.type === 'Real Estate' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-500'}`}>
                            {group.type === 'Real Estate' ? <Building2 className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        </div>
                        {assetName}
                        <span className="text-xs font-normal text-muted-foreground ml-2 px-2 py-0.5 rounded-full border border-white/10">
                            {group.docs.length} file{group.docs.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Documents Grid for this Asset */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-2 border-l-2 border-white/5">
                        {group.docs.map((doc: any, i: number) => (
                            <div key={i} className="group flex flex-col justify-between p-4 bg-[#111827]/50 border border-white/5 rounded-xl hover:border-primary/30 transition-all hover:bg-[#111827]">
                                <div>
                                    <div className="flex items-start justify-between mb-3">
                                        <FileText className="h-8 w-8 text-slate-500 group-hover:text-primary transition-colors" />
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={doc.url} target="_blank" className="p-1.5 hover:bg-white/10 rounded text-emerald-400" title="Download">
                                                <Download className="h-4 w-4"/>
                                            </a>
                                            <button onClick={() => handleDelete(doc)} className="p-1.5 hover:bg-white/10 rounded text-red-400" title="Delete">
                                                <Trash2 className="h-4 w-4"/>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="font-medium text-sm text-slate-200 truncate" title={doc.name}>
                                        {doc.name}
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-muted-foreground">
                                    <span>{doc.date}</span>
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded">PDF/IMG</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {Object.keys(groupedDocs).length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                        <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No documents found matching your search.</p>
                </div>
            )}
        </div>
    </div>
  );
}