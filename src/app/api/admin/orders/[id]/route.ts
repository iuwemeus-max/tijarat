import { NextResponse } from "next/server";
import { cancelOrder, getOrder, updateOrderStatus } from "@/lib/services/orders";
import { requireRole } from "@/lib/auth-helpers";
import { ORDER_STATUSES } from "@/lib/constants";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(["OWNER", "ADMIN", "WAREHOUSE", "SUPPORT"]);
    const order = await getOrder(params.id);
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(["OWNER", "ADMIN", "WAREHOUSE"]);
    const body = await request.json();
    if (!ORDER_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (body.status === "CANCELLED") {
      const order = await cancelOrder(params.id);
      return NextResponse.json(order);
    }
    const order = await updateOrderStatus(params.id, body.status);
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
