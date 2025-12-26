import { NextResponse } from "next/server";
import { updateProduct } from "@/lib/services/products";
import { requireRole } from "@/lib/auth-helpers";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(["OWNER", "ADMIN"]);
    const body = await request.json();
    const product = await updateProduct(params.id, body);
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
