import { ProductsClient } from "./ProductsClient";
import { listProducts } from "@/lib/services/products";

export default async function ProductsPage() {
  const products = await listProducts();
  return <ProductsClient initial={products} />;
}
