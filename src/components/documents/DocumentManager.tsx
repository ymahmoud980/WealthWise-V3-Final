
"use client";

import { useState, useEffect, useRef } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DocumentedItem, Document } from "@/lib/types";

interface DocumentManagerProps {
  item: DocumentedItem;
}

export function DocumentManager({ item }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const listFiles = async () => {
    setIsLoading(true);
    try {
      const listRef = ref(storage, item.id);
      const res = await listAll(listRef);
      const files = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        })
      );
      setDocuments(files);
    } catch (error) {
      console.error("Error listing files:", error);
      toast({
        title: "Error fetching documents",
        description: "Could not retrieve the list of documents.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    listFiles();
  }, [item.id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleUpload(event.target.files[0]);
    }
  };

  const handleUpload = (file: File) => {
    if (!file) return;

    const storageRef = ref(storage, `${item.id}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setIsUploading(true);
    setUploadProgress(0);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({
          title: "Upload Failed",
          description: "There was an error uploading your file.",
          variant: "destructive",
        });
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(() => {
          toast({
            title: "Upload Complete",
            description: `${file.name} has been uploaded successfully.`,
          });
          setIsUploading(false);
          listFiles(); // Refresh the list
        });
      }
    );
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
        return;
    }

    const fileRef = ref(storage, `${item.id}/${fileName}`);
    try {
      await deleteObject(fileRef);
      toast({
        title: "File Deleted",
        description: `${fileName} has been deleted.`,
      });
      listFiles(); // Refresh the list
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the file.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-3 py-2">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading documents...</span>
        </div>
      ) : documents.length > 0 ? (
        documents.map((doc) => (
          <div key={doc.name} className="flex items-center justify-between text-sm">
            <span className="truncate">{doc.name}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> View
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(doc.name)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-xs text-muted-foreground italic">No documents uploaded for this item yet.</p>
      )}

      {isUploading && (
        <div className="space-y-1">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">Uploading... {Math.round(uploadProgress)}%</p>
        </div>
      )}

      <div className="pt-2">
        <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload New Document
        </Button>
      </div>
    </div>
  );
}
