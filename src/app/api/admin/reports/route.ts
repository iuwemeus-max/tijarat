import { NextResponse } from "next/server";
import { getReports } from "@/lib/services/reports";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireRole(["OWNER", "ADMIN"]);
    const data = await getReports();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
