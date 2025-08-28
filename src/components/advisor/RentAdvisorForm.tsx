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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2, TrendingUp } from "lucide-react";

import { suggestOptimalRentIncreases, type SuggestOptimalRentIncreasesOutput } from "@/ai/flows/suggest-optimal-rent-increases";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  propertyLocation: z.string().min(2, "Location is required."),
  currentMarketValue: z.coerce.number().min(1, "Market value must be positive."),
  historicalRentalIncome: z.string().min(10, "Please provide some historical income data."),
  localRegulations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function RentAdvisorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestOptimalRentIncreasesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyLocation: "",
      currentMarketValue: 0,
      historicalRentalIncome: "",
      localRegulations: "Standard rent control laws apply.",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setSuggestion(null);

    try {
      // Dummy conversion of string to structured data
      const historicalRentalIncome = values.historicalRentalIncome.split('\n').map(line => {
        const [year, income] = line.split(':');
        return { year: parseInt(year), income: parseInt(income.replace(/[^0-9]/g, '')) };
      }).filter(item => !isNaN(item.year) && !isNaN(item.income));

      if (historicalRentalIncome.length === 0) {
        toast({ title: "Invalid historical data", description: "Please format as 'YYYY: amount'.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const result = await suggestOptimalRentIncreases({
        ...values,
        localRegulations: values.localRegulations || 'None',
        historicalRentalIncome,
      });
      setSuggestion(result);
    } catch (error) {
      console.error("Error getting suggestion:", error);
      toast({
        title: "Suggestion Failed",
        description: "Could not get a suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="propertyLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., New Cairo, Egypt" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currentMarketValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Market Value (USD)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="150000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="historicalRentalIncome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Historical Rental Income</FormLabel>
                <FormControl>
                  <Textarea placeholder="2022: 600&#x0a;2023: 650&#x0a;2024: 700" {...field} />
                </FormControl>
                <FormDescription>
                  Enter each year on a new line, formatted as 'YYYY: amount'.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="localRegulations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local Regulations</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Max 10% increase per year." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            Get Suggestion
          </Button>
        </form>
      </Form>
      
      <div className="flex items-center justify-center">
        {isLoading && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
        {!isLoading && suggestion && (
          <Card className="w-full bg-secondary">
            <CardHeader className="text-center">
              <CardTitle>AI Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <TrendingUp className="h-12 w-12 text-primary" />
                <div>
                  <p className="text-muted-foreground">Suggested Increase</p>
                  <p className="text-5xl font-bold text-primary">{suggestion.suggestedRentIncrease}%</p>
                </div>
              </div>
              <div className="text-left p-4 bg-background rounded-lg">
                <p className="font-semibold mb-2">Reasoning:</p>
                <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {!isLoading && !suggestion && (
          <div className="text-center text-muted-foreground">
            <Lightbulb className="mx-auto h-16 w-16" />
            <p className="mt-4">Your AI suggestion will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
