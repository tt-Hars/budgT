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
  import { AddTransactionForm } from "./add-transaction-form"
  import { useState } from "react"

  export function AddTransactionDialog() {
    const [open, setOpen] = useState(false)

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Log an expense, income, or transfer.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto px-1">
             <AddTransactionForm onSuccess={() => setOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    )
  }
