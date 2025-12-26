import { OrderDetailClient } from "./OrderDetailClient";
import { getOrder } from "@/lib/services/orders";
import Link from "next/link";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  if (!order) {
    return <div className="card p-6">Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Order {order.id.slice(0, 10)}</h1>
          <p className="text-sm text-slate-500">Placed {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <Link href="/admin/orders" className="text-sm text-brand-700">
          Back to orders
        </Link>
      </div>

      <OrderDetailClient order={order as any} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4 md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Items</h2>
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-xs text-slate-500">SKU {item.product.sku}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <div>Qty: {item.quantity}</div>
                  <div>AED {(Number(item.unitPrice) * item.quantity).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>AED {Number(order.subtotal).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery Fee</dt>
              <dd>AED {Number(order.deliveryFee).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between font-semibold text-slate-900">
              <dt>Total</dt>
              <dd>AED {Number(order.total).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Total Quantity</dt>
              <dd>{order.totalQuantity}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-slate-900">Customer</h3>
          <div className="mt-2 text-sm text-slate-700">
            <div>{order.customerName}</div>
            {order.email && <div>{order.email}</div>}
            <div>{order.phone}</div>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-slate-900">Address</h3>
          <div className="mt-2 text-sm text-slate-700">
            <div>{order.addressLine1}</div>
            <div>{order.city}</div>
            <div>{order.emirate}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
