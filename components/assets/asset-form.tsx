"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Loader2 } from "lucide-react"
import { createAsset, uploadAssetPhoto } from "@/lib/actions/assets"
import { UpgradeDialog } from "@/components/upgrade-dialog"

interface AssetFormProps {
  household: any
  rooms: any[]
  locale: string
}

export function AssetForm({ household, rooms, locale }: AssetFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string>("")
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const router = useRouter()
  const t = useTranslations("assets.new")

  const handlePhotoUpload = async (file: File) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("photo", file)

      const result = await uploadAssetPhoto(formData)
      if (result.success) {
        setPhotoUrl(result.url)
      }
    } catch (error) {
      console.error("Photo upload failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      // Add household ID and photo URL to form data
      formData.append("household_id", household.id)
      if (photoUrl) {
        formData.append("photo_url", photoUrl)
      }

      await createAsset(formData)
      router.push(`/${locale}/assets`)
    } catch (error: any) {
      if (error.message.includes("Asset limit reached")) {
        setShowUpgradeDialog(true)
      } else {
        console.error("Failed to create asset:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="border-indigo/10">
        <CardHeader>
          <CardTitle className="text-indigo">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>{t("photoUpload")}</Label>
              <div className="border-2 border-dashed border-indigo/20 rounded-lg p-6 text-center">
                {photoUrl ? (
                  <div className="relative">
                    <img src={photoUrl || "/placeholder.svg"} alt="Asset" className="max-h-48 mx-auto rounded-lg" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={() => setPhotoUrl("")}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-12 h-12 text-indigo/40 mx-auto" />
                    <p className="text-indigo/60">Take a photo or upload an image</p>
                    <Input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoUpload(file)
                      }}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Asset Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")} *</Label>
                <Input id="name" name="name" required className="border-indigo/20" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_id">{t("room")} *</Label>
                <Select name="room_id" required>
                  <SelectTrigger className="border-indigo/20">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">{t("type")}</Label>
                <Input id="type" name="type" className="border-indigo/20" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">{t("brand")}</Label>
                <Input id="brand" name="brand" className="border-indigo/20" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">{t("model")}</Label>
                <Input id="model" name="model" className="border-indigo/20" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial">{t("serial")}</Label>
                <Input id="serial" name="serial" className="border-indigo/20" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_date">{t("purchaseDate")}</Label>
                <Input id="purchase_date" name="purchase_date" type="date" className="border-indigo/20" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_expiry">{t("warrantyExpiry")}</Label>
                <Input id="warranty_expiry" name="warranty_expiry" type="date" className="border-indigo/20" />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-indigo/20 text-indigo"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-indigo hover:bg-indigo/90 text-white">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t("save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        onUpgrade={() => {
          // Handle upgrade logic
          setShowUpgradeDialog(false)
        }}
      />
    </>
  )
}
