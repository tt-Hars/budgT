import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddAccountForm } from "./add-account-form"
import { useState } from "react"

export function AddAccountDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
          <DialogDescription>
            Add a new bank account, credit card, or wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto px-1">
            <AddAccountForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
