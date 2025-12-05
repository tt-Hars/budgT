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
import { AccountForm } from "./add-account-form"
import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Account } from "@/db"

interface AccountDialogProps {
  account?: Account
  children?: React.ReactNode // If provided, uses this as trigger. If not, uses default + button.
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AccountDialog({ account, children, open: controlledOpen, onOpenChange: controlledOnOpenChange }: AccountDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const title = account ? "Edit Account" : "Add Account";
  const description = account ? "Update account details." : "Add a new bank account, credit card, or wallet.";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Account
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
            <AccountForm account={account} onSuccess={() => setOpen(false)} />
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
              <Plus className="mr-2 h-4 w-4" /> Add Account
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
            <AccountForm account={account} onSuccess={() => setOpen(false)} />
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
