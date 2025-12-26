import { NextResponse } from "next/server";
import { applyStockMovement, listMovements } from "@/lib/services/inventory";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireRole(["OWNER", "ADMIN", "WAREHOUSE"]);
    const movements = await listMovements();
    return NextResponse.json(movements);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["OWNER", "ADMIN", "WAREHOUSE"]);
    const body = await request.json();
    const movement = await applyStockMovement(body);
    return NextResponse.json(movement, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
