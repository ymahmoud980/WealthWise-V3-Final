import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { RentAdvisorForm } from "@/components/advisor/RentAdvisorForm";

export default function AdvisorPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <BrainCircuit className="h-8 w-8" />
        </div>
        <div>
            <h1 className="text-3xl font-bold">AI Financial Advisor</h1>
            <p className="text-muted-foreground">
                Leverage AI to get personalized financial insights and recommendations.
            </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Optimal Rent Increase Advisor</CardTitle>
          <CardDescription>
            Fill in the property details below to receive an AI-powered suggestion for rent adjustments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RentAdvisorForm />
        </CardContent>
      </Card>
    </div>
  );
}
