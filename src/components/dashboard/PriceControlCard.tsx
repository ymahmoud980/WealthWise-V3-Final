
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/hooks/use-currency";
import { Gem, Scale } from "lucide-react";

export function PriceControlCard() {
    const { 
        goldPricePerOunce, 
        setGoldPricePerOunce,
        silverPricePerOunce,
        setSilverPricePerOunce
    } = useCurrency();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Precious Metal Prices</CardTitle>
                <CardDescription>Manually set the spot prices for your metal assets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="gold-price" className="flex items-center gap-2 text-sm">
                        <Gem className="h-4 w-4 text-yellow-500" />
                        <span>Gold Price (USD per Ounce)</span>
                    </Label>
                    <Input
                        id="gold-price"
                        type="number"
                        value={goldPricePerOunce}
                        onChange={(e) => setGoldPricePerOunce(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 2330"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="silver-price" className="flex items-center gap-2 text-sm">
                        <Scale className="h-4 w-4 text-slate-400" />
                        <span>Silver Price (USD per Ounce)</span>
                    </Label>
                    <Input
                        id="silver-price"
                        type="number"
                        value={silverPricePerOunce}
                        onChange={(e) => setSilverPricePerOunce(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 30"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
