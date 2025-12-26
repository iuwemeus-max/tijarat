import { KpiCard } from "@/components/ui/KpiCard";
import { getDashboardMetrics } from "@/lib/services/dashboard";
import { listOrders } from "@/lib/services/orders";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();
  const recentOrders = await listOrders();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-5">
        <KpiCard title="Total Orders" value={metrics.ordersCount} />
        <KpiCard title="Gross Revenue (AED)" value={metrics.grossRevenue.toFixed(2)} />
        <KpiCard title="COD Outstanding" value={metrics.codOutstanding.toFixed(2)} />
        <KpiCard title="Delivery Fees" value={metrics.deliveryFees.toFixed(2)} />
        <KpiCard title="Quantity Sold" value={metrics.totalQuantity} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-brand-700 hover:text-brand-800">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Status</th>
                <th>Total</th>
                <th>Qty</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentOrders.slice(0, 8).map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-brand-700">
                      {order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td>
                    <span className="badge-blue">{order.status}</span>
                  </td>
                  <td>AED {Number(order.total).toFixed(2)}</td>
                  <td>{order.totalQuantity}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
