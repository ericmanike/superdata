import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import type { Transaction } from "@/app/lib/mockData";

export async function GET() {
  const db = await getDb();
  const transactions = await db
    .collection<Transaction>("transactions")
    .find({})
    .sort({ date: -1 })
    .toArray();

  return NextResponse.json(transactions);
}
