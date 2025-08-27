"use client"

import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpgrade: () => void
}

export function UpgradeDialog({ open, onOpenChange, onUpgrade }: UpgradeDialogProps) {
  const t = useTranslations("tiers.upgradeDialog")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-indigo">{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={onUpgrade} className="bg-indigo hover:bg-indigo/90 text-white">
            {t("upgrade")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
