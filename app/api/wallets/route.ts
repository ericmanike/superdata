import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import type { Wallet } from "@/app/lib/mockData";

export async function GET() {
  const db = await getDb();
  const wallets = await db
    .collection<Wallet>("wallets")
    .find({})
    .sort({ balance: -1 })
    .toArray();

  return NextResponse.json(wallets);
}
