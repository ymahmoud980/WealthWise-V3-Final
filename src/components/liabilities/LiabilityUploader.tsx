
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { extractLiabilityDetails } from "@/ai/flows/extract-liability-details"

export function LiabilityUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [extractedDetails, setExtractedDetails] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please choose a document to upload.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const documentDataUri = reader.result as string
      try {
        const result = await extractLiabilityDetails({ documentDataUri })
        setExtractedDetails(result.details)
        setIsDialogOpen(true)
      } catch (error) {
        console.error("Error extracting details:", error)
        toast({
          title: "Extraction Failed",
          description: "Could not extract details from the document. Please try a different file.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    reader.onerror = (error) => {
        console.error("Error reading file:", error)
        toast({
          title: "File Read Error",
          description: "There was an issue reading your file.",
          variant: "destructive",
        })
        setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Extract Liability Details</CardTitle>
          <CardDescription>
            Upload a contract or payment plan to automatically extract installment details using AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Input type="file" onChange={handleFileChange} className="flex-1" accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"/>
          <Button onClick={handleUpload} disabled={isLoading || !file} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            Extract Details
          </Button>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extracted Liability Details</DialogTitle>
            <DialogDescription>
              Review the details extracted by AI. You can copy this information to manually add the liability.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
            {extractedDetails}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
