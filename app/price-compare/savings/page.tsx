import { getSavingsRecords } from "@/lib/actions/price-alerts"
import { SavingsTracker } from "@/components/price-compare/savings-tracker"

export default async function SavingsPage() {
  const savingsRecords = await getSavingsRecords()

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Savings Tracker</h1>
        <p className="text-muted-foreground">Track your savings and see how much you've saved over time</p>
      </div>

      <SavingsTracker initialRecords={savingsRecords} />
    </div>
  )
}
