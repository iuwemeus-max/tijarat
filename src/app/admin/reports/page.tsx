import { getReports } from "@/lib/services/reports";
import { KpiCard } from "@/components/ui/KpiCard";

export default async function ReportsPage() {
  const report = await getReports();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Gross Revenue (AED)" value={report.grossRevenue.toFixed(2)} />
        <KpiCard title="Delivery Collected" value={report.deliveryCollected.toFixed(2)} />
        <KpiCard title="Orders" value={report.orders} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="text-lg font-semibold text-slate-900">COD Breakdown</h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <dt>Paid</dt>
              <dd className="font-semibold text-green-700">AED {report.codPaid.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Outstanding</dt>
              <dd className="font-semibold text-red-700">AED {report.codUnpaid.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
        <div className="card p-4">
          <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
          <p className="text-sm text-slate-600">
            Delivery fee enforcement happens server-side and is reflected in revenue and collected delivery metrics.
            COD only payments remain outstanding until an admin records cash collection.
          </p>
        </div>
      </div>
    </div>
  );
}
