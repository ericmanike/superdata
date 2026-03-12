import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import type { Wallet } from "@/app/lib/mockData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const db = await getDb();
  const wallet = await db
    .collection<Wallet>("wallets")
    .findOne(userId ? { userId } : {});

  if (!wallet) {
    return NextResponse.json(
      { error: "Wallet not found. Create a user to initialize one." },
      { status: 404 }
    );
  }

  return NextResponse.json(wallet);
}
