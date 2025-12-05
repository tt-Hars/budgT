import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TransactionForm } from "./add-transaction-form"
import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Transaction } from "@/db"

interface TransactionDialogProps {
  transaction?: Transaction
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TransactionDialog({ transaction, children, open: controlledOpen, onOpenChange: controlledOnOpenChange }: TransactionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const title = transaction ? "Edit Transaction" : "Add Transaction";
  const description = transaction ? "Update transaction details." : "Log an expense, income, or transfer.";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
             <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
             </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto px-1">
            <TransactionForm transaction={transaction} onSuccess={() => setOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children || (
            <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>
                {description}
            </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
            <TransactionForm transaction={transaction} onSuccess={() => setOpen(false)} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
