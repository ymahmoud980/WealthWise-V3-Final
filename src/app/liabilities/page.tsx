
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
import { PlusCircle, Trash2, Edit, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { liabilities as initialLiabilities } from "@/lib/data"
import { useCurrency } from "@/hooks/use-currency"
import { LiabilityUploader } from "@/components/liabilities/LiabilityUploader"
import type { Liability, Currency } from "@/lib/types"
import { AddLiabilityDialog } from "@/components/liabilities/AddLiabilityDialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LiabilitiesPage() {
  const { format } = useCurrency()
  const [liabilities, setLiabilities] = useState<Liability[]>(initialLiabilities)
  const [isAddLiabilityDialogOpen, setIsAddLiabilityDialogOpen] = useState(false)
  const [editingLiabilityId, setEditingLiabilityId] = useState<string | null>(null)
  const [editedLiabilities, setEditedLiabilities] = useState<Record<string, Liability>>({})

  const handleEdit = (liability: Liability) => {
    setEditingLiabilityId(liability.id)
    setEditedLiabilities(prev => ({ ...prev, [liability.id]: { ...liability } }))
  }

  const handleSave = (id: string) => {
    setLiabilities(prevLiabilities => prevLiabilities.map(liability => liability.id === id ? editedLiabilities[id] : liability))
    setEditingLiabilityId(null)
    const newEditedLiabilities = { ...editedLiabilities }
    delete newEditedLiabilities[id]
    setEditedLiabilities(newEditedLiabilities)
  }
  
  const handleEditChange = (id: string, field: keyof Liability, value: any) => {
    setEditedLiabilities(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  const handleDelete = (id: string) => {
    setLiabilities(liabilities.filter((liability) => liability.id !== id))
  }

  const handleAddLiability = (newLiability: Omit<Liability, 'id' | 'dueDate'> & {dueDate: string}) => {
    setLiabilities([...liabilities, { ...newLiability, id: crypto.randomUUID() }])
    setIsAddLiabilityDialogOpen(false)
  }
  
  const isEditing = (id: string) => editingLiabilityId === id;

  return (
    <div className="space-y-8">
      <LiabilityUploader />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liability Overview</CardTitle>
            <CardDescription>Track your installments and loans.</CardDescription>
          </div>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setIsAddLiabilityDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Liability
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project/Loan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Monthly Installment</TableHead>
                <TableHead className="text-right">Remaining Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liabilities.map((liability) => {
                const remaining = isEditing(liability.id) 
                  ? editedLiabilities[liability.id].totalAmount - editedLiabilities[liability.id].amountPaid
                  : liability.totalAmount - liability.amountPaid
                const progress = isEditing(liability.id)
                  ? editedLiabilities[liability.id].totalAmount > 0 ? (editedLiabilities[liability.id].amountPaid / editedLiabilities[liability.id].totalAmount) * 100 : 0
                  : liability.totalAmount > 0 ? (liability.amountPaid / liability.totalAmount) * 100 : 0
                
                const currentLiability = isEditing(liability.id) ? editedLiabilities[liability.id] : liability;

                return (
                  <TableRow key={liability.id}>
                    <TableCell className="font-medium">
                      {isEditing(liability.id) ? <Input value={currentLiability.name} onChange={e => handleEditChange(liability.id, 'name', e.target.value)} /> : currentLiability.name}
                    </TableCell>
                    <TableCell>
                      {isEditing(liability.id) ? (
                        <Select value={currentLiability.type} onValueChange={value => handleEditChange(liability.id, 'type', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Real Estate">Real Estate</SelectItem>
                            <SelectItem value="Loan">Loan</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : currentLiability.type}
                    </TableCell>
                    <TableCell>
                      {isEditing(liability.id) ? (
                        <Select value={currentLiability.currency} onValueChange={(value: Currency) => handleEditChange(liability.id, 'currency', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EGP">EGP</SelectItem>
                            <SelectItem value="KWD">KWD</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="TRY">TRY</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : <Badge variant="outline">{currentLiability.currency}</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-32" />
                        <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {isEditing(liability.id) ? <Input type="number" className="text-right" value={currentLiability.monthlyInstallment} onChange={e => handleEditChange(liability.id, 'monthlyInstallment', parseFloat(e.target.value))} /> : format(currentLiability.monthlyInstallment, currentLiability.currency)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {currentLiability.totalAmount > 0 ? format(remaining, currentLiability.currency) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       {isEditing(liability.id) ? (
                        <Button variant="ghost" size="icon" onClick={() => handleSave(liability.id)}>
                          <Save className="h-4 w-4 text-primary" />
                          <span className="sr-only">Save</span>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(liability)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
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
      <AddLiabilityDialog
        isOpen={isAddLiabilityDialogOpen}
        onClose={() => setIsAddLiabilityDialogOpen(false)}
        onAddLiability={handleAddLiability}
      />
    </div>
  )
}
