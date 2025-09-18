
"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, ExternalLink, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { RealEstateAsset, UnderDevelopmentAsset, Installment, Loan } from "@/lib/types";

type DocumentedItem = (RealEstateAsset | UnderDevelopmentAsset | Installment | Loan) & { name: string };

const DocumentRow = ({ item }: { item: DocumentedItem }) => {

  const openDocument = (filename: string) => {
    window.open(`/documents/${filename}`, '_blank');
  };

  return (
    <div className="p-3 bg-secondary rounded-md">
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          ID for reference: <span className="font-mono bg-muted px-1 py-0.5 rounded">{item.id}</span>
        </p>
      </div>
      <div className="mt-2 pl-4 border-l-2 border-primary/20">
        {item.documents && item.documents.length > 0 ? (
          <div className="space-y-2">
            {item.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">{doc}</span>
                <Button variant="outline" size="sm" onClick={() => openDocument(doc)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No documents listed. Export your data, add filenames to the 'documents' array for this item, and re-import.
          </p>
        )}
      </div>
    </div>
  );
};

export default function DocumentsPage() {
  const { data } = useFinancialData();

  const allItems: DocumentedItem[] = [
    ...data.assets.realEstate.map(a => ({ ...a, name: `Asset: ${a.name}` })),
    ...data.assets.underDevelopment.map(a => ({ ...a, name: `Asset: ${a.name}` })),
    ...data.liabilities.installments.map(i => ({ ...i, name: `Liability: ${i.project}` })),
    ...data.liabilities.loans.map(l => ({ ...l, name: `Liability: ${l.lender} Loan` })),
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
                Access all your documents for assets and liabilities in one place.
            </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How to Link Documents</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1">
            <li>Place your document (e.g., <span className="font-mono bg-background px-1 rounded">my-contract.pdf</span>) inside the <span className="font-mono bg-background px-1 rounded">public/documents/</span> folder.</li>
            <li>Export your current data using the "Export" button in the header.</li>
            <li>Open the exported JSON file and find the asset or liability you want to link (using its ID).</li>
            <li>Add the filename to its <span className="font-mono bg-background px-1 rounded">"documents"</span> array. For example: <span className="font-mono bg-background px-1 rounded">"documents": ["my-contract.pdf"]</span>.</li>
            <li>Save the JSON file and import it back into the application. The document will now appear below.</li>
          </ol>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>All Assets & Liabilities</CardTitle>
          <CardDescription>
            Manage and view the documents linked to each item.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            {allItems.map(item => (
                <DocumentRow key={item.id} item={item} />
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
