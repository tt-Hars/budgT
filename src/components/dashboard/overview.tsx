import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccounts } from "@/hooks/use-db"
import { Wallet } from "lucide-react"
import type { Account } from "@/db"

interface DashboardOverviewProps {
    accounts: Account[] | undefined
}

export function DashboardOverviewView({ accounts }: DashboardOverviewProps) {
    // Simple total balance calculation (converting everything to numbers, ignoring currency conversion for now as MVP assumes single currency mostly or 1:1)
    const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }

    return (
        <Card className="shadow-sm border-muted-foreground/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Total Balance
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                <p className="text-xs text-muted-foreground">
                     across {accounts?.length || 0} accounts
                </p>
            </CardContent>
        </Card>
    )
}

export function DashboardOverview() {
    const accounts = useAccounts()
    return <DashboardOverviewView accounts={accounts} />
}
