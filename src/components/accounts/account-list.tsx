import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccounts } from "@/hooks/use-db"
import { AddAccountDialog } from "./add-account-dialog"
import { CreditCard, Wallet, Banknote, Building2 } from "lucide-react"

export function AccountList() {
  const accounts = useAccounts()

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
        <AddAccountDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {accounts?.map((account) => (
          <Card key={account.id}>
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
