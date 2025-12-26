import { NextResponse } from "next/server";
import { markPaymentPaid } from "@/lib/services/orders";
import { requireRole } from "@/lib/auth-helpers";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(["OWNER", "ADMIN"]);
    const payment = await markPaymentPaid(params.id);
    return NextResponse.json(payment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
