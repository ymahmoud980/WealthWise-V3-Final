
"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";
import type { DocumentedItem } from "@/lib/types";
import { DocumentManager } from "@/components/documents/DocumentManager";


export default function DocumentsPage() {
  const { data } = useFinancialData();

  // Create a unified list of all items that can have documents.
  const allItems: DocumentedItem[] = [
    ...data.assets.realEstate.map(a => ({ id: a.id, name: `Asset: ${a.name}` })),
    ...data.assets.underDevelopment.map(a => ({ id: a.id, name: `Asset: ${a.name}` })),
    ...data.liabilities.installments.map(i => ({ id: i.id, name: `Liability: ${i.project}` })),
    ...data.liabilities.loans.map(l => ({ id: l.id, name: `Liability: ${l.lender} Loan` })),
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <FolderKanban className="h-8 w-8" />
        </div>
        <div>
            <h1 className="text-3xl font-bold">Document Manager</h1>
            <p className="text-muted-foreground">
                Upload, view, and delete documents for your assets and liabilities.
            </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assets & Liabilities</CardTitle>
          <CardDescription>
            Manage documents linked to each item below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            {allItems.map(item => (
                <div key={item.id} className="p-3 bg-secondary rounded-md">
                    <p className="font-medium">{item.name}</p>
                    <div className="mt-2 pl-4 border-l-2 border-primary/20">
                      <DocumentManager item={item} />
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
