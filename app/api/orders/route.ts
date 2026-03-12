import { NextResponse } from "next/server";
import { orders } from "@/app/lib/mockData";

export async function GET() {
  return NextResponse.json(orders);
}
