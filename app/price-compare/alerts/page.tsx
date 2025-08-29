import { getPriceAlerts } from "@/lib/actions/price-alerts"
import { PriceAlertsManager } from "@/components/price-compare/price-alerts-manager"

export default async function PriceAlertsPage() {
  const alerts = await getPriceAlerts()

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Price Alerts</h1>
        <p className="text-muted-foreground">Get notified when your favorite products drop to your target price</p>
      </div>

      <PriceAlertsManager initialAlerts={alerts} />
    </div>
  )
}
