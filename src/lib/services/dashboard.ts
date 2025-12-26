import { PaymentStatus } from "@prisma/client";
import { prisma } from "../prisma";

export async function getDashboardMetrics() {
  const [ordersCount, revenueAgg, unpaidAgg, deliveryAgg, quantityAgg] = await Promise.all([
    prisma.order.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.PAID } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.UNPAID } }),
    prisma.order.aggregate({ _sum: { deliveryFee: true } }),
    prisma.order.aggregate({ _sum: { totalQuantity: true } }),
  ]);

  return {
    ordersCount,
    grossRevenue: Number(revenueAgg._sum.amount ?? 0),
    codOutstanding: Number(unpaidAgg._sum.amount ?? 0),
    deliveryFees: Number(deliveryAgg._sum.deliveryFee ?? 0),
    totalQuantity: Number(quantityAgg._sum.totalQuantity ?? 0),
  };
}
