import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccounts } from "@/hooks/use-db"
import { AddAccountDialog } from "./add-account-dialog"
import { CreditCard, Wallet, Banknote, Building2 } from "lucide-react"
import type { Account } from "@/db"

interface AccountListProps {
  accounts: Account[] | undefined
  onAddAccount?: () => void
}

export function AccountListView({ accounts }: AccountListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'CREDIT_CARD': return <CreditCard className="h-5 w-5" />;
      case 'WALLET': return <Wallet className="h-5 w-5" />;
      case 'CASH': return <Banknote className="h-5 w-5" />;
      default: return <Building2 className="h-5 w-5" />;
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Accounts</h2>
        {/* If onAddAccount is passed, we could render a button, but here we keep the dialog or make it pluggable.
            For now, we keep the Dialog but it needs context.
            To keep pure, we might just slot it or ignore for storybook.
            However, AddAccountDialog is coupled to DB.
            Let's keep it here for now but ideally it should be lifted too.
        */}
        <AddAccountDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {accounts?.map((account) => (
          <Card key={account.id} className="shadow-sm border-muted-foreground/20 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {account.name}
              </CardTitle>
              {getIcon(account.type)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(account.balance, account.currency)}</div>
              <p className="text-xs text-muted-foreground">
                {account.type.replace('_', ' ')}
                {account.type === 'CREDIT_CARD' && account.creditCardDetails && (
                    <span className="block mt-1">
                        Due Day: {account.creditCardDetails.dueDay}
                    </span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
        {accounts?.length === 0 && (
            <div className="text-center p-4 text-muted-foreground border border-dashed rounded-lg">
                No accounts found. Add one to get started.
            </div>
        )}
      </div>
    </div>
  )
}

export function AccountList() {
  const accounts = useAccounts()
  return <AccountListView accounts={accounts} />
}
