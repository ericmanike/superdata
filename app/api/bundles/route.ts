import { NextResponse } from "next/server";
import { bundles } from "@/app/lib/mockData";

export async function GET() {
  return NextResponse.json(bundles);
}
