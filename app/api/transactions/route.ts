import { NextResponse } from "next/server";
import { transactions } from "@/app/lib/mockData";

export async function GET() {
  return NextResponse.json(transactions);
}
