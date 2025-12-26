import { listOrders } from "@/lib/services/orders";
import { OrdersClient } from "./OrdersClient";
import type { Order, Payment } from "@prisma/client";

export default async function OrdersPage() {
  const orders = await listOrders();
  return <OrdersClient initial={orders as (Order & { payment: Payment | null })[]} />;
}
