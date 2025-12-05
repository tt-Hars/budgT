import { ThemeProvider } from "@/contexts/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Toaster } from "@/components/ui/sonner"
import { AccountList } from "@/components/accounts/account-list"
import { TransactionList } from "@/components/transactions/transaction-list"
import { DashboardOverview } from "@/components/dashboard/overview"
import { Button } from "@/components/ui/button"
import { exportDataToCSV } from "@/services/data-export"
import { Download } from "lucide-react"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <header className="px-4 py-3 border-b flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
          <h1 className="text-xl font-bold tracking-tight">budgT</h1>
          <div className="flex gap-1 items-center">
             <Button variant="ghost" size="icon" onClick={() => exportDataToCSV()} title="Export Backup">
                <Download className="h-5 w-5" />
             </Button>
             <ModeToggle />
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-8 pb-20 max-w-2xl space-y-8">
           <section className="space-y-4">
             <DashboardOverview />
           </section>

           <section className="space-y-4">
             <AccountList />
           </section>

           <section className="space-y-4">
             <TransactionList />
           </section>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App
