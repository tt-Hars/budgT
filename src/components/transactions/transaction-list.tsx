import { Card, CardContent } from "@/components/ui/card"
import { useTransactions, useAccounts } from "@/hooks/use-db"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { format } from "date-fns"
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react"
import type { Transaction, Account } from "@/db"

interface TransactionListProps {
    transactions: Transaction[] | undefined
    accounts: Account[] | undefined
}

export function TransactionListView({ transactions, accounts }: TransactionListProps) {
  const getAccountName = (id: string) => {
      return accounts?.find(a => a.id === id)?.name || "Unknown Account"
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'INCOME': return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'EXPENSE': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'TRANSFER': return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  }

  const formatCurrency = (amount: number) => {
     // Ideally look up currency from account, but defaulting to USD/locale for list view
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        <AddTransactionDialog />
      </div>

      <div className="space-y-3">
        {transactions?.map((transaction) => (
          <Card key={transaction.id} className="overflow-hidden shadow-sm border-muted-foreground/20 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                        {getIcon(transaction.type)}
                    </div>
                    <div>
                        <div className="font-medium">{transaction.description || transaction.category}</div>
                        <div className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), 'MMM d, yyyy')} • {getAccountName(transaction.accountId)}
                            {transaction.type === 'TRANSFER' && ` -> ${getAccountName(transaction.transferToAccountId || "")}`}
                        </div>
                    </div>
                </div>
                <div className={`font-bold ${transaction.type === 'INCOME' ? 'text-green-500' : transaction.type === 'EXPENSE' ? 'text-red-500' : ''}`}>
                    {transaction.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </div>
            </CardContent>
          </Card>
        ))}
         {transactions?.length === 0 && (
            <div className="text-center p-4 text-muted-foreground border border-dashed rounded-lg">
                No transactions found.
            </div>
        )}
      </div>
    </div>
  )
}

export function TransactionList() {
  const transactions = useTransactions()
  const accounts = useAccounts()
  return <TransactionListView transactions={transactions} accounts={accounts} />
}
