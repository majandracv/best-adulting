"use client"

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-indigo">Upgrade Required</DialogTitle>
          <DialogDescription>You've reached your plan limit. Upgrade to continue using this feature.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onUpgrade} className="bg-indigo hover:bg-indigo/90 text-white">
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
