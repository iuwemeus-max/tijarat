import { prisma } from "../prisma";
import { productInput, ProductInput } from "../validators/product";

export async function listProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createProduct(input: ProductInput) {
  const data = productInput.parse(input);
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const data = productInput.partial().parse(input);
  return prisma.product.update({ where: { id }, data });
}
