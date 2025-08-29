
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
import { PlusCircle, Trash2, Edit, Save } from "lucide-react"

import { assets as initialAssets } from "@/lib/data"
import { useCurrency } from "@/hooks/use-currency"
import type { Asset, Currency } from "@/lib/types"
import { AddAssetDialog } from "@/components/assets/AddAssetDialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AssetsPage() {
  const { format } = useCurrency()
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false)
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null)
  const [editedAssets, setEditedAssets] = useState<Record<string, Asset>>({})

  const handleEdit = (asset: Asset) => {
    setEditingAssetId(asset.id)
    setEditedAssets(prev => ({ ...prev, [asset.id]: { ...asset } }))
  }

  const handleSave = (id: string) => {
    setAssets(prevAssets => prevAssets.map(asset => asset.id === id ? editedAssets[id] : asset))
    setEditingAssetId(null)
    const newEditedAssets = { ...editedAssets }
    delete newEditedAssets[id]
    setEditedAssets(newEditedAssets)
  }

  const handleEditChange = (id: string, field: keyof Asset, value: any) => {
    setEditedAssets(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  const handleDelete = (id: string) => {
    setAssets(assets.filter((asset) => asset.id !== id))
  }

  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => {
    setAssets([...assets, { ...newAsset, id: crypto.randomUUID() }])
    setIsAddAssetDialogOpen(false)
  }
  
  const isEditing = (id: string) => editingAssetId === id;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Financial Assets</CardTitle>
            <CardDescription>Manage and track your properties, cash, and other assets.</CardDescription>
          </div>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setIsAddAssetDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Rental Income (Monthly)</TableHead>
                <TableHead className="text-right">Market Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">
                    {isEditing(asset.id) ? (
                      <Input value={editedAssets[asset.id]?.name} onChange={(e) => handleEditChange(asset.id, 'name', e.target.value)} />
                    ) : (
                      asset.name
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing(asset.id) ? (
                      <Select value={editedAssets[asset.id]?.location} onValueChange={(value) => handleEditChange(asset.id, 'location', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Egypt">Egypt</SelectItem>
                          <SelectItem value="Turkey">Turkey</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={asset.location === 'Egypt' ? 'secondary' : 'outline'}>
                        {asset.location}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing(asset.id) ? (
                      <Input value={editedAssets[asset.id]?.type} onChange={(e) => handleEditChange(asset.id, 'type', e.target.value)} />
                    ) : (
                      asset.type
                    )}
                  </TableCell>
                   <TableCell>
                    {isEditing(asset.id) ? (
                       <Select value={editedAssets[asset.id]?.currency} onValueChange={(value: Currency) => handleEditChange(asset.id, 'currency', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EGP">EGP</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="KWD">KWD</SelectItem>
                          <SelectItem value="TRY">TRY</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline">{asset.currency}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                     {isEditing(asset.id) ? (
                      <Input type="number" value={editedAssets[asset.id]?.rentalIncome} onChange={(e) => handleEditChange(asset.id, 'rentalIncome', parseFloat(e.target.value))} className="text-right" />
                    ) : (
                      format(asset.rentalIncome, asset.currency)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing(asset.id) ? (
                      <Input type="number" value={editedAssets[asset.id]?.marketValue} onChange={(e) => handleEditChange(asset.id, 'marketValue', parseFloat(e.target.value))} className="text-right" />
                    ) : (
                      format(asset.marketValue, asset.currency)
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {isEditing(asset.id) ? (
                        <Button variant="ghost" size="icon" onClick={() => handleSave(asset.id)}>
                          <Save className="h-4 w-4 text-primary" />
                          <span className="sr-only">Save</span>
                        </Button>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                    )}
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
      <AddAssetDialog
        isOpen={isAddAssetDialogOpen}
        onClose={() => setIsAddAssetDialogOpen(false)}
        onAddAsset={handleAddAsset}
      />
    </>
  )
}
