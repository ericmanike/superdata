import { NextResponse } from "next/server";
import { wallet } from "@/app/lib/mockData";

export async function GET() {
  return NextResponse.json(wallet);
}
