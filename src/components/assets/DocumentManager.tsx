"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText, Trash2, ExternalLink } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { AssetDocument } from "@/lib/types";

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

    // 1. Basic Validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit check
        alert("File is too large. Please upload files smaller than 5MB.");
        return;
    }

    setIsUploading(true);
    try {
      console.log("Starting upload for:", file.name);

      // 2. Create Reference
      // Note: We use a timestamp in the name to prevent duplicates overwriting each other
      const fileRef = ref(storage, `assets/${assetId}/${Date.now()}_${file.name}`);
      
      // 3. Upload
      console.log("Uploading bytes...");
      const snapshot = await uploadBytes(fileRef, file);
      console.log("Upload success!", snapshot);
      
      // 4. Get URL
      console.log("Getting URL...");
      const url = await getDownloadURL(fileRef);
      console.log("Got URL:", url);

      // 5. Update State
      const newDoc: AssetDocument = {
        id: Date.now().toString(),
        name: file.name,
        url: url,
        uploadedAt: new Date().toLocaleDateString()
      };

      // Update the parent component
      onUpdate([...documents, newDoc]);
      alert("Upload Successful!"); // Confirmation Alert

    } catch (error: any) {
      console.error("Upload FAILED:", error);
      
      // --- THE LOUD ERROR MESSAGE ---
      if (error.code === 'storage/unauthorized') {
        alert("Error: Permission Denied. Check Firebase Storage Rules.");
      } else if (error.code === 'storage/canceled') {
        alert("Error: Upload canceled.");
      } else if (error.code === 'storage/unknown') {
        alert("Error: Unknown error. Check Browser Console.");
      } else {
        alert(`Upload Failed: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
      // Reset the input so you can upload the same file again if needed
      e.target.value = ''; 
    }
  };

  const handleDelete = async (doc: AssetDocument) => {
    if (!confirm("Delete this document?")) return;
    const newList = documents.filter(d => d.id !== doc.id);
    onUpdate(newList);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-300">Attached Documents</h4>
        <div className="relative">
            <input 
                type="file" 
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isUploading}
            />
            <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 relative">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {isUploading ? "Uploading..." : "Upload File"}
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