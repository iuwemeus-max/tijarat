import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { calculateTotals } from "./pricing";
import { stockMovementSchema } from "../validators/inventory";

export async function createOrderFromCart(input: {
  customerName: string;
  email?: string;
  phone: string;
  addressLine1: string;
  city: string;
  emirate: string;
  items: { productId: string; quantity: number }[];
}) {
  if (!input.items.length) throw new Error("Cart is empty");

  return await prisma.$transaction(async (tx) => {
    const productIds = input.items.map((i) => i.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds }, active: true } });

    const pricedItems = input.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} unavailable`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      return { product, quantity: item.quantity, unitPrice: Number(product.price) };
    });

    const { subtotal, totalQuantity, deliveryFee, total } = calculateTotals(
      pricedItems.map((p) => ({ quantity: p.quantity, unitPrice: p.unitPrice }))
    );

    const order = await tx.order.create({
      data: {
        customerName: input.customerName,
        email: input.email,
        phone: input.phone,
        addressLine1: input.addressLine1,
        city: input.city,
        emirate: input.emirate,
        subtotal,
        deliveryFee,
        total,
        totalQuantity,
        items: {
          create: pricedItems.map((p) => ({
            productId: p.product.id,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
          })),
        },
        payment: {
          create: {
            amount: total,
            status: PaymentStatus.UNPAID,
            method: "COD",
          },
        },
      },
      include: { items: true, payment: true },
    });

    for (const item of pricedItems) {
      const updated = await tx.product.updateMany({
        where: { id: item.product.id, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) throw new Error(`Insufficient stock for ${item.product.name}`);

      await tx.stockMovement.create({
        data: {
          productId: item.product.id,
          quantity: item.quantity,
          type: "OUT",
          reason: `Order ${order.id} reservation`,
          reference: order.id,
        },
      });
    }

    return order;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function listOrders(filter?: { status?: OrderStatus }) {
  return prisma.order.findMany({
    where: filter?.status ? { status: filter.status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true },
  });
}

export async function getOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, payment: true },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  return order;
}

export async function markPaymentPaid(orderId: string) {
  const payment = await prisma.payment.update({
    where: { orderId },
    data: { status: PaymentStatus.PAID, collectedAt: new Date() },
  });
  await prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.CONFIRMED } });
  return payment;
}

export async function cancelOrder(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new Error("Order not found");

    if (order.status === OrderStatus.CANCELLED) return order;

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: "RETURN",
          reason: `Cancellation of order ${order.id}`,
          reference: order.id,
        },
      });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });
  });
}

export async function recordManualStock(input: {
  productId: string;
  type: "IN" | "OUT" | "ADJUST" | "RETURN";
  quantity: number;
  reason?: string;
  reference?: string;
}) {
  stockMovementSchema.parse(input);
  const adjustment = input.type === "OUT" ? -input.quantity : input.quantity;

  return prisma.$transaction(async (tx) => {
    if (input.type === "OUT") {
      const updated = await tx.product.updateMany({
        where: { id: input.productId, stock: { gte: input.quantity } },
        data: { stock: { decrement: input.quantity } },
      });
      if (updated.count === 0) throw new Error("Insufficient stock");
    } else if (input.type === "ADJUST") {
      await tx.product.update({
        where: { id: input.productId },
        data: { stock: { increment: adjustment } },
      });
    } else {
      await tx.product.update({
        where: { id: input.productId },
        data: { stock: { increment: input.quantity } },
      });
    }

    return tx.stockMovement.create({
      data: {
        productId: input.productId,
        quantity: input.quantity,
        type: input.type,
        reason: input.reason,
        reference: input.reference,
      },
    });
  });
}
