import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/services/products";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireRole(["OWNER", "ADMIN", "WAREHOUSE", "SUPPORT"]);
    const products = await listProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["OWNER", "ADMIN"]);
    const body = await request.json();
    const product = await createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
