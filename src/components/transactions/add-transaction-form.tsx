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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addTransaction, updateTransaction, deleteTransaction, useAccounts } from "@/hooks/use-db"
import { toast } from "sonner"
import { CalendarIcon, Trash2, Wand2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Transaction } from "@/db"
import { useState } from "react"
import { parseSMS } from "@/services/sms-parser"

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

interface TransactionFormProps {
    transaction?: Transaction
    onSuccess?: () => void
}

export function TransactionForm({ transaction, onSuccess }: TransactionFormProps) {
  const accounts = useAccounts()
  const isEditing = !!transaction
  const [smsText, setSmsText] = useState("")
  const [isParsing, setIsParsing] = useState(false)

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema) as any,
    defaultValues: {
      amount: transaction?.amount || 0,
      type: (transaction?.type as any) || "EXPENSE",
      description: transaction?.description || "",
      category: transaction?.category || "General",
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      tags: transaction?.tags ? transaction.tags.join(', ') : "",
      accountId: transaction?.accountId || "",
      transferToAccountId: transaction?.transferToAccountId || "",
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

        const transactionData = {
            accountId: values.accountId,
            amount: values.amount,
            type: values.type,
            category: values.category || "General",
            description: values.description || "",
            tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            date: values.date.getTime(),
            transferToAccountId: values.type === 'TRANSFER' ? values.transferToAccountId : undefined
        }

      if (isEditing && transaction) {
          await updateTransaction(transaction.id, transactionData)
          toast.success("Transaction updated successfully")
      } else {
          await addTransaction({
            ...transactionData,
            createdAt: Date.now(),
          })
          toast.success("Transaction added successfully")
      }

      form.reset()
      setSmsText("")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error(isEditing ? "Failed to update transaction" : "Failed to add transaction")
    }
  }

  async function onDelete() {
      if (!transaction) return;
      if (confirm("Are you sure you want to delete this transaction?")) {
          try {
              await deleteTransaction(transaction.id);
              toast.success("Transaction deleted successfully");
              onSuccess?.();
          } catch (error) {
              console.error(error);
              toast.error("Failed to delete transaction");
          }
      }
  }

  async function handleParseSMS() {
    if (!smsText.trim()) return;

    // Check for API key
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        toast.error("OpenAI API key not found in environment variables.");
        return;
    }

    setIsParsing(true);
    try {
        const result = await parseSMS(smsText, apiKey);

        if (result.amount) form.setValue("amount", result.amount);
        if (result.type) form.setValue("type", result.type as any);
        if (result.date) form.setValue("date", new Date(result.date));
        if (result.merchant) form.setValue("description", result.merchant);

        // Try to match account by name
        if (result.accountName && accounts) {
            const matchedAccount = accounts.find(a =>
                a.name.toLowerCase().includes(result.accountName!.toLowerCase()) ||
                result.accountName!.toLowerCase().includes(a.name.toLowerCase())
            );
            if (matchedAccount) {
                form.setValue("accountId", String(matchedAccount.id));
            }
        }

        toast.success("SMS parsed successfully!");
    } catch (error) {
        console.error(error);
        toast.error("Failed to parse SMS. Please try again.");
    } finally {
        setIsParsing(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {!isEditing && (
            <div className="space-y-2 border p-3 rounded-md bg-muted/20">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Auto-fill from SMS
                </label>
                <div className="flex gap-2">
                    <Textarea
                        placeholder="Paste transaction SMS here..."
                        value={smsText}
                        onChange={(e) => setSmsText(e.target.value)}
                        className="resize-none min-h-[60px]"
                    />
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleParseSMS}
                    disabled={!smsText.trim() || isParsing}
                    className="w-full"
                >
                    {isParsing ? "Parsing..." : (
                        <>
                            <Wand2 className="mr-2 h-3 w-3" /> Auto-fill with AI
                        </>
                    )}
                </Button>
            </div>
        )}

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
                      <SelectItem key={acc.id} value={String(acc.id) || "unknown"}>{acc.name} ({acc.currency})</SelectItem>
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
                         <SelectItem key={acc.id} value={String(acc.id) || ""}>{acc.name} ({acc.currency})</SelectItem>
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

        <div className="flex gap-2">
            <Button type="submit" className="flex-1">{isEditing ? "Update Transaction" : "Add Transaction"}</Button>
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
