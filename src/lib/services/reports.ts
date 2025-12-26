import { PaymentStatus } from "@prisma/client";
import { prisma } from "../prisma";

export async function getReports() {
  const [revenue, deliveryFees, paid, unpaid, orders] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.aggregate({ _sum: { deliveryFee: true } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.PAID } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.UNPAID } }),
    prisma.order.count(),
  ]);

  return {
    grossRevenue: Number(revenue._sum.total ?? 0),
    deliveryCollected: Number(deliveryFees._sum.deliveryFee ?? 0),
    codPaid: Number(paid._sum.amount ?? 0),
    codUnpaid: Number(unpaid._sum.amount ?? 0),
    orders,
  };
}
