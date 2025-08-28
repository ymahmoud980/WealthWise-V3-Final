"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

import { liabilities as initialLiabilities } from "@/lib/data"
import { useCurrency } from "@/hooks/use-currency"
import { LiabilityUploader } from "@/components/liabilities/LiabilityUploader"

export default function LiabilitiesPage() {
  const { format } = useCurrency()
  const [liabilities, setLiabilities] = useState(initialLiabilities)

  const handleDelete = (id: string) => {
    setLiabilities(liabilities.filter((liability) => liability.id !== id))
  }

  return (
    <div className="space-y-8">
      <LiabilityUploader />
      <Card>
        <CardHeader>
          <CardTitle>Liability Overview</CardTitle>
          <CardDescription>Track your installments and loans.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project/Loan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Remaining Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liabilities.map((liability) => {
                const remaining = liability.totalAmount - liability.amountPaid
                const progress = (liability.amountPaid / liability.totalAmount) * 100
                return (
                  <TableRow key={liability.id}>
                    <TableCell className="font-medium">{liability.name}</TableCell>
                    <TableCell>{liability.type}</TableCell>
                    <TableCell>{new Date(liability.dueDate).toLocaleDateString('en-CA')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-32" />
                        <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{format(remaining)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(liability.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
