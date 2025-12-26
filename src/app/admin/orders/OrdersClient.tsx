"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order, OrderStatus, Payment } from "@prisma/client";

interface OrderWithPayment extends Order {
  payment: Payment | null;
}

const statusOrder: OrderStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PACKING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function OrdersClient({ initial }: { initial: OrderWithPayment[] }) {
  const [orders, setOrders] = useState(initial);
  const [status, setStatus] = useState<string>("");

  const loadOrders = async (nextStatus?: string) => {
    const res = await fetch(`/api/admin/orders${nextStatus ? `?status=${nextStatus}` : ""}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  };

  useEffect(() => {
    loadOrders(status || undefined);
  }, [status]);

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      await loadOrders(status || undefined);
    }
  };

  const markPaid = async (id: string) => {
    const res = await fetch(`/api/admin/orders/${id}/pay`, { method: "POST" });
    if (res.ok) {
      await loadOrders(status || undefined);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-slate-900">Orders</h2>
        <select
          className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {statusOrder.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Total</th>
              <th>Qty</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-brand-700">
                    {order.id.slice(0, 8)}
                  </Link>
                  <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</div>
                </td>
                <td>{order.status}</td>
                <td>AED {Number(order.total).toFixed(2)}</td>
                <td>{order.totalQuantity}</td>
                <td>
                  <span className={order.payment?.status === "PAID" ? "badge-green" : "badge-yellow"}>
                    {order.payment?.status || "UNPAID"}
                  </span>
                </td>
                <td className="space-x-2 text-sm">
                  {order.payment?.status === "UNPAID" && (
                    <button
                      onClick={() => markPaid(order.id)}
                      className="rounded bg-brand-600 px-3 py-1 text-white"
                    >
                      Mark COD Paid
                    </button>
                  )}
                  <select
                    className="rounded border border-slate-200 px-2 py-1"
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  >
                    {statusOrder.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
