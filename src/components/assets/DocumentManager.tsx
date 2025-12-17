"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText, Trash2, ExternalLink } from "lucide-react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { AssetDocument } from "@/lib/types";
import { v4 as uuidv4 } from "uuid"; // We will use a simple random ID generator

interface DocumentManagerProps {
  assetId: string;
  documents: AssetDocument[];
  onUpdate: (newDocs: AssetDocument[]) => void;
}

export function DocumentManager({ assetId, documents = [], onUpdate }: DocumentManagerProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Create a reference (Folder: assets/{assetId}/{filename})
      const fileRef = ref(storage, `assets/${assetId}/${file.name}`);
      
      // 2. Upload
      await uploadBytes(fileRef, file);
      
      // 3. Get the URL
      const url = await getDownloadURL(fileRef);

      // 4. Update the list
      const newDoc: AssetDocument = {
        id: Date.now().toString(), // Simple ID
        name: file.name,
        url: url,
        uploadedAt: new Date().toLocaleDateString()
      };

      onUpdate([...documents, newDoc]);

    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: AssetDocument) => {
    if (!confirm("Delete this document permanently?")) return;
    
    // Remove from List (Visual)
    const newList = documents.filter(d => d.id !== doc.id);
    onUpdate(newList);

    // Ideally, we also delete from Storage, but for safety/simplicity 
    // we just unlink it from the UI for now.
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-300">Attached Documents</h4>
        <div className="relative">
            <input 
                type="file" 
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
            />
            <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {isUploading ? "Uploading..." : "Upload PDF/Image"}
            </Button>
        </div>
      </div>

      <div className="space-y-2">
        {documents.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No documents attached.</p>
        )}
        
        {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5 group">
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm text-slate-300 hover:text-blue-400 truncate hover:underline flex items-center gap-1">
                        {doc.name}
                        <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive opacity-50 group-hover:opacity-100"
                    onClick={() => handleDelete(doc)}
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        ))}
      </div>
    </div>
  );
}