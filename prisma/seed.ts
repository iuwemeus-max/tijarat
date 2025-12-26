import { PrismaClient, Role, StockMovementType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const ownerPassword = await hash("owner123", 10);
  const adminPassword = await hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "owner@tijarat.ae" },
    update: {},
    create: {
      email: "owner@tijarat.ae",
      name: "Business Owner",
      passwordHash: ownerPassword,
      role: Role.OWNER,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@tijarat.ae" },
    update: {},
    create: {
      email: "admin@tijarat.ae",
      name: "Admin User",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const products = [
    { sku: "SKU-1001", name: "Desert Breeze Perfume", price: 180.0, stock: 40 },
    { sku: "SKU-1002", name: "Oasis Hydration Bottle", price: 60.0, stock: 80 },
    { sku: "SKU-1003", name: "Date Delight Box", price: 45.0, stock: 120 },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { sku: product.sku },
      update: { ...product },
      create: { ...product },
    });

    await prisma.stockMovement.create({
      data: {
        productId: created.id,
        type: StockMovementType.IN,
        quantity: product.stock,
        reason: "Initial seed stock",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
