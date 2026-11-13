import { useMemo } from "react";
import { CalendarDays, FlaskConical } from "lucide-react";
import { Badge } from "@/renderer/components/ui/badge";
import { useAuth } from "@/renderer/context/auth-context";
import { KpiTile } from "./KpiTile";
import { HourlySalesCard, PaymentMixCard, RecentInvoicesCard, SalesTrendCard, TopProductsCard } from "./HomeCharts";
import { buildDailySales, hourlySales, kpis, paymentMix, recentInvoices, topProducts } from "./sample-data";

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const longDate = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });

const Home = () => {
  const { user } = useAuth();
  const today = useMemo(() => new Date(), []);
  const dailySales = useMemo(() => buildDailySales(today), [today]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">
            {greetingFor(today)}
            {user ? `, ${user.username}` : ""}
          </h2>
          <p className="text-sm text-muted-foreground">Here's how the shop is doing · {longDate.format(today)}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Placeholder figures until reporting routes exist; never mistake them for real data. */}
          <Badge variant="warning" className="gap-1 py-1">
            <FlaskConical aria-hidden="true" />
            Sample data
          </Badge>
          <span className="inline-flex h-9 items-center gap-2 rounded-field border border-border bg-card px-3 text-sm font-medium">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
            Last 30 days
          </span>
        </div>
      </div>

      <section aria-label="Key figures" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiTile key={kpi.id} kpi={kpi} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesTrendCard data={dailySales} />
        </div>
        <PaymentMixCard data={paymentMix} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HourlySalesCard data={hourlySales} />
        <TopProductsCard data={topProducts} />
      </section>

      <RecentInvoicesCard data={recentInvoices} />
    </div>
  );
};

export default Home;
