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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"

import { assets as initialAssets } from "@/lib/data"
import { useCurrency } from "@/hooks/use-currency"

export default function AssetsPage() {
  const { format } = useCurrency()
  const [assets, setAssets] = useState(initialAssets)

  const handleDelete = (id: string) => {
    setAssets(assets.filter((asset) => asset.id !== id))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Real Estate Assets</CardTitle>
          <CardDescription>Manage and track your properties.</CardDescription>
        </div>
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Rental Income (Monthly)</TableHead>
              <TableHead className="text-right">Market Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>
                  <Badge variant={asset.location === 'Egypt' ? 'secondary' : 'outline'}>
                    {asset.location}
                  </Badge>
                </TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell className="text-right">{format(asset.rentalIncome)}</TableCell>
                <TableCell className="text-right">{format(asset.marketValue)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
