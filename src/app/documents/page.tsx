"use client";

import { useState } from "react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Download, Trash2, Search, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { storage } from "@/lib/firebase";
import { ref, deleteObject } from "firebase/storage";

export default function DocumentsPage() {
  const { data, setData } = useFinancialData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Gather all documents from all assets
  const allDocs: any[] = [];
  
  const collectDocs = (list: any[], type: string) => {
    list.forEach(asset => {
        if (asset.documents) {
            asset.documents.forEach((doc: any) => {
                allDocs.push({
                    ...doc,
                    assetName: asset.name,
                    assetId: asset.id,
                    assetType: type
                });
            });
        }
    });
  };

  collectDocs(data.assets.realEstate || [], "Real Estate");
  collectDocs(data.assets.underDevelopment || [], "Off-Plan");

  // 2. Delete Logic (Same as Asset Page)
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

  const filteredDocs = allDocs.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.assetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-white">Document Vault</h1>
                <p className="text-muted-foreground">All your attached files in one place.</p>
            </div>
            <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search documents..." 
                    className="pl-9 bg-[#111827] border-white/10 text-white"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc, i) => (
                <Card key={i} className="bg-[#111827] border-white/10 hover:border-primary/50 transition-all">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex gap-1">
                                <a href={doc.url} target="_blank" className="p-2 hover:bg-white/10 rounded text-emerald-400"><Download className="h-4 w-4"/></a>
                                <button onClick={() => handleDelete(doc)} className="p-2 hover:bg-white/10 rounded text-red-400"><Trash2 className="h-4 w-4"/></button>
                            </div>
                        </div>
                        <CardTitle className="text-sm font-medium mt-3 truncate" title={doc.name}>{doc.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {doc.assetName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[10px] text-muted-foreground text-right">{doc.date}</p>
                    </CardContent>
                </Card>
            ))}
            {filteredDocs.length === 0 && (
                <div className="col-span-full text-center py-20 text-muted-foreground border-2 border-dashed border-white/10 rounded-xl">
                    No documents found. Attach files from the Assets page.
                </div>
            )}
        </div>
    </div>
  );
}