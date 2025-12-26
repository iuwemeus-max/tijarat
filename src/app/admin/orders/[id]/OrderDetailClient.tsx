"use client";

import { useRouter } from "next/navigation";
import type { Order, OrderItem, Payment, Product } from "@prisma/client";

interface Props {
  order: Order & { items: (OrderItem & { product: Product })[]; payment: Payment | null };
}

const statusOptions = ["PENDING_PAYMENT", "CONFIRMED", "PACKING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function OrderDetailClient({ order }: Props) {
  const router = useRouter();

  const updateStatus = async (status: string) => {
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) router.refresh();
  };

  const markPaid = async () => {
    const res = await fetch(`/api/admin/orders/${order.id}/pay`, { method: "POST" });
    if (res.ok) router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="badge-blue">{order.status}</span>
        <span className={order.payment?.status === "PAID" ? "badge-green" : "badge-yellow"}>
          {order.payment?.status || "UNPAID"}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <button
          onClick={markPaid}
          disabled={order.payment?.status === "PAID"}
          className="rounded-lg bg-brand-700 px-3 py-2 text-white shadow hover:bg-brand-800 disabled:opacity-60"
        >
          Mark COD as Paid
        </button>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2"
          value={order.status}
          onChange={(e) => updateStatus(e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
