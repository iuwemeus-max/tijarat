import { NextResponse } from "next/server";
import { listOrders } from "@/lib/services/orders";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    await requireRole(["OWNER", "ADMIN", "WAREHOUSE", "SUPPORT"]);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const orders = await listOrders(status ? { status: status as any } : undefined);
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
