import { prisma } from "../prisma";
import { stockMovementSchema, StockMovementInput } from "../validators/inventory";
import { recordManualStock } from "./orders";

export async function listMovements(limit = 50) {
  return prisma.stockMovement.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });
}

export async function applyStockMovement(input: StockMovementInput) {
  return recordManualStock(input);
}
