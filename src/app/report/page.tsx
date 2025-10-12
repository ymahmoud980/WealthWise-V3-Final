
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, Download } from "lucide-react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { useToast } from "@/hooks/use-toast";
import { generateFinancialReport } from "@/ai/flows/generate-financial-report";
import { format as formatDate } from "date-fns";

export default function ReportPage() {
  const { data, metrics } = useFinancialData();
  const { currency, rates } = useCurrency();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await generateFinancialReport({
        financialData: data,
        metrics: metrics,
        displayCurrency: currency,
        currentDate: formatDate(new Date(), 'yyyy-MM-dd'),
        exchangeRates: rates,
      });
      setReport(result.report);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Report Generation Failed",
        description: "Could not generate the financial report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Financial-Report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Financial Report</CardTitle>
          <CardDescription>
            Generate a detailed, well-organized report of your entire financial situation, including assets, liabilities, cash flow, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateReport} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generate Full Report
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-16 space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-muted-foreground">Generating your detailed report... This may take a moment.</p>
        </div>
      )}

      {report && (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Financial Report</CardTitle>
                 <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                </Button>
            </CardHeader>
            <CardContent>
                <div className="p-4 bg-secondary rounded-md text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                    {report}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
