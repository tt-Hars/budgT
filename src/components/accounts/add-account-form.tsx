import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addAccount, updateAccount, deleteAccount } from "@/hooks/use-db"
import { toast } from "sonner"
import type { Account } from "@/db"
import { Trash2 } from "lucide-react"

const accountFormSchema = z.object({
  name: z.string().min(2, {
    message: "Account name must be at least 2 characters.",
  }),
  type: z.enum(["SAVINGS", "CHECKING", "CREDIT_CARD", "WALLET", "CASH"]),
  balance: z.coerce.number(),
  currency: z.string().default("USD"),
  creditCardDetails: z.object({
    limit: z.coerce.number().optional(),
    billingDay: z.coerce.number().min(1).max(31).optional(),
    dueDay: z.coerce.number().min(1).max(31).optional(),
  }).optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  account?: Account
  onSuccess?: () => void
}

export function AccountForm({ account, onSuccess }: AccountFormProps) {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema) as any,
    defaultValues: {
      name: account?.name || "",
      type: (account?.type as any) || "SAVINGS",
      balance: account?.balance || 0,
      currency: account?.currency || "USD",
      creditCardDetails: account?.creditCardDetails ? {
        limit: account.creditCardDetails.limit,
        billingDay: account.creditCardDetails.billingDay,
        dueDay: account.creditCardDetails.dueDay,
      } : undefined
    },
  })

  const accountType = form.watch("type")
  const isEditing = !!account

  async function onSubmit(values: z.infer<typeof accountFormSchema>) {
    try {
      // Clean up credit card details if not a credit card
      if (values.type !== 'CREDIT_CARD') {
         delete values.creditCardDetails;
      } else {
         // Ensure numbers for credit card details
         if(values.creditCardDetails) {
            values.creditCardDetails.limit = Number(values.creditCardDetails.limit || 0);
            values.creditCardDetails.billingDay = Number(values.creditCardDetails.billingDay || 1);
            values.creditCardDetails.dueDay = Number(values.creditCardDetails.dueDay || 1);
         }
      }

      const accountData = {
        ...values,
        updatedAt: Date.now(),
        // Fix for type mismatch if necessary, or ensure clean object
        creditCardDetails: values.type === 'CREDIT_CARD' && values.creditCardDetails ? {
             limit: Number(values.creditCardDetails.limit),
             billingDay: Number(values.creditCardDetails.billingDay),
             dueDay: Number(values.creditCardDetails.dueDay)
        } : undefined
      }

      if (isEditing && account) {
        await updateAccount(account.id, accountData)
        toast.success("Account updated successfully")
      } else {
        await addAccount({
          ...accountData,
          createdAt: Date.now(),
        })
        toast.success("Account created successfully")
      }

      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error(isEditing ? "Failed to update account" : "Failed to create account")
    }
  }

  async function onDelete() {
    if (!account) return;
    if (confirm("Are you sure you want to delete this account? All associated transactions will also be deleted.")) {
      try {
        await deleteAccount(account.id);
        toast.success("Account deleted successfully");
        onSuccess?.();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete account");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control as any}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Chase Sapphire" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as any}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                  <SelectItem value="CHECKING">Checking</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="WALLET">Wallet</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as any}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Balance</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormDescription>
                For Credit Cards, enter current outstanding as negative or 0.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {accountType === "CREDIT_CARD" && (
          <div className="space-y-4 border p-4 rounded-md">
            <h4 className="font-medium">Credit Card Details</h4>
            <FormField
              control={form.control as any}
              name="creditCardDetails.limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Limit</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="flex gap-4">
                <FormField
                  control={form.control as any}
                  name="creditCardDetails.billingDay"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Billing Day</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="31" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="creditCardDetails.dueDay"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Due Day</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="31" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>
          </div>
        )}

        <div className="flex gap-2">
            <Button type="submit" className="flex-1">{isEditing ? "Update Account" : "Create Account"}</Button>
            {isEditing && (
                <Button type="button" variant="destructive" size="icon" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
      </form>
    </Form>
  )
}
