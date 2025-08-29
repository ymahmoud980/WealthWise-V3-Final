
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Loader2, Sparkles } from "lucide-react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useToast } from "@/hooks/use-toast";
import { answerDocumentQuestion, type AnswerDocumentQuestionOutput } from "@/ai/flows/answer-document-question";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  contextId: z.string().min(1, "Please select an asset or liability."),
  question: z.string().min(10, "Please enter a clear question."),
  document: z.any(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InsightsPage() {
  const { data } = useFinancialData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnswerDocumentQuestionOutput | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contextId: "",
      question: "",
    },
  });

  const allItems = [
    ...data.assets.realEstate.map(a => ({ id: a.id, name: `Asset: ${a.name}` })),
    ...data.liabilities.installments.map(i => ({ id: i.id, name: `Liability: ${i.project}` })),
    ...data.liabilities.loans.map(l => ({ id: l.id, name: `Liability: ${l.lender} Loan` })),
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a document to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const documentDataUri = reader.result as string;
      try {
        const selectedItem = allItems.find(item => item.id === values.contextId);
        const context = selectedItem ? selectedItem.name : "General";

        const result = await answerDocumentQuestion({
          documentDataUri,
          context,
          question: values.question,
        });
        setAnalysis(result);
      } catch (error) {
        console.error("Error getting analysis:", error);
        toast({
          title: "Analysis Failed",
          description: "Could not analyze the document. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "There was an issue reading your file.",
        variant: "destructive",
      });
      setIsLoading(false);
    };
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Document Analysis</CardTitle>
          <CardDescription>
            Get specific answers from your financial documents. Select an asset or liability, upload the relevant document, and ask a question.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contextId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Asset/Liability</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an item..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {allItems.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Document</FormLabel>
                      <FormControl>
                        <Input type="file" onChange={handleFileChange} accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                      </FormControl>
                      <FormDescription>Upload a contract, statement, or payment plan.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Question</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., What is the final handover date for this project? or What are the penalties for late payment?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileQuestion className="mr-2 h-4 w-4" />}
                Analyze Document
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )}

      {analysis && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-accent"/>
                    <span>Analysis Result</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold text-muted-foreground">Your Question:</h4>
                    <p className="p-3 bg-muted rounded-md mt-1">{form.getValues('question')}</p>
                </div>
                <Separator />
                <div>
                    <h4 className="font-semibold text-primary">AI Answer:</h4>
                    <p className="p-3 bg-primary/10 text-primary-foreground/90 rounded-md mt-1 whitespace-pre-wrap">{analysis.answer}</p>
                </div>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
