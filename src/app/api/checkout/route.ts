import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validators/checkout";
import { createOrderFromCart } from "@/lib/services/orders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = checkoutSchema.parse(body);
    const order = await createOrderFromCart(payload);
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
