import { SalesChart } from "@/components/analytics/SalesChart";
import { RestockRecommendation } from "@/components/analytics/RestockRecommendation";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Insights into your business performance.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-2">
                    <SalesChart />
                </div>
                <div className="col-span-1">
                    <RestockRecommendation />
                </div>
            </div>
        </div>
    );
}
