import { listProducts } from "@/lib/services/products";
import { InventoryClient } from "./InventoryClient";

export default async function InventoryPage() {
  const products = await listProducts();
  return <InventoryClient products={products} />;
}
