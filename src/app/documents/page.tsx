
"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, ExternalLink, Info } from "lucide-react";
import type { RealEstateAsset, UnderDevelopmentAsset, Installment, Loan, Document } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";


type DocumentedItem = (RealEstateAsset | UnderDevelopmentAsset | Installment | Loan) & { 
  name: string;
  type: 'asset' | 'liability';
  documents?: Document[];
};

export default function DocumentsPage() {
  const { data } = useFinancialData();

  const allItems: DocumentedItem[] = [
    ...data.assets.realEstate.map(a => ({ ...a, name: `Asset: ${a.name}`, type: 'asset' as 'asset' })),
    ...data.assets.underDevelopment.map(a => ({ ...a, name: `Asset: ${a.name}`, type: 'asset' as 'asset' })),
    ...data.liabilities.installments.map(i => ({ ...i, name: `Liability: ${i.project}`, type: 'liability' as 'liability' })),
    ...data.liabilities.loans.map(l => ({ ...l, name: `Liability: ${l.lender} Loan`, type: 'liability' as 'liability' })),
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <FolderKanban className="h-8 w-8" />
        </div>
        <div>
            <h1 className="text-3xl font-bold">Document Library</h1>
            <p className="text-muted-foreground">
                View documents for your assets and liabilities.
            </p>
        </div>
      </div>

       <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How to Manage Documents</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>In your project files, find the `public/documents/` folder.</li>
            <li>Inside `documents`, create a new folder with the ID of the item (e.g., `re1-apt1`).</li>
            <li>Place your PDF or image files inside that newly created folder.</li>
            <li>To link them, you must edit the `src/lib/data.ts` file and add the filenames to the `documents` array for the corresponding item.</li>
          </ol>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>All Assets & Liabilities</CardTitle>
          <CardDescription>
            Documents linked to each item are listed below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            {allItems.map(item => (
                <div key={item.id} className="p-3 bg-secondary rounded-md">
                    <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Required Folder Path: <span className="font-mono bg-muted px-1 py-0.5 rounded">public/documents/{item.id}/</span>
                        </p>
                    </div>
                    <div className="mt-2 pl-4 border-l-2 border-primary/20">
                       <div className="space-y-2 py-2">
                          {(item.documents && item.documents.length > 0) ? (
                            item.documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm">{doc.name}</span>
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={`/documents/${item.id}/${doc.name}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4"/>
                                    View
                                  </a>
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No documents linked. Edit `data.ts` to add file names.</p>
                          )}
                       </div>
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
