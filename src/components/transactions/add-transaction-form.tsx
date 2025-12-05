import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
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
import { addTransaction, useAccounts } from "@/hooks/use-db"
import { toast } from "sonner"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const transactionFormSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  accountId: z.string().min(1, "Account is required"),
  transferToAccountId: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.date(),
  tags: z.string().optional(), // Comma separated for now
})

// Infer the type from the schema
type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export function AddTransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const accounts = useAccounts()

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema) as any,
    defaultValues: {
      amount: 0,
      type: "EXPENSE",
      description: "",
      category: "General",
      date: new Date(),
      tags: "",
      accountId: "",
    },
  })

  const type = form.watch("type")

  async function onSubmit(values: TransactionFormValues) {
    try {
        if (values.type === 'TRANSFER' && !values.transferToAccountId) {
            form.setError('transferToAccountId', { message: "Destination account is required for transfers" })
            return;
        }

        if (values.type === 'TRANSFER' && values.accountId === values.transferToAccountId) {
             form.setError('transferToAccountId', { message: "Cannot transfer to the same account" })
             return;
        }

      await addTransaction({
        accountId: values.accountId,
        amount: values.amount,
        type: values.type,
        category: values.category || "General",
        description: values.description || "",
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
        date: values.date.getTime(),
        createdAt: Date.now(),
        transferToAccountId: values.type === 'TRANSFER' ? values.transferToAccountId : undefined
      })
      toast.success("Transaction added successfully")
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to add transaction")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control as any}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{type === 'INCOME' ? 'To Account' : 'From Account'}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts?.map(acc => (
                      <SelectItem key={acc.id} value={acc.id || "unknown"}>{acc.name} ({acc.currency})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === 'TRANSFER' && (
             <FormField
             control={form.control as any}
             name="transferToAccountId"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>To Account</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                   <FormControl>
                     <SelectTrigger>
                       <SelectValue placeholder="Select destination account" />
                     </SelectTrigger>
                   </FormControl>
                   <SelectContent>
                     {accounts?.map(acc => (
                         <SelectItem key={acc.id} value={acc.id || ""}>{acc.name} ({acc.currency})</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 <FormMessage />
               </FormItem>
             )}
           />
        )}

        <FormField
          control={form.control as any}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Food, Rent, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Lunch with friends" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control as any}
            name="tags"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                    <Input placeholder="personal, work (comma separated)" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <Button type="submit" className="w-full">Add Transaction</Button>
      </form>
    </Form>
  )
}
