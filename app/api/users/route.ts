import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import type { User, Wallet } from "@/app/lib/mockData";

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function GET() {
  const db = await getDb();
  const users = await db.collection<User>("users").find({}).toArray();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, walletBalance = 0 } = body ?? {};

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "name, email and phone are required" },
        { status: 400 }
      );
    }

    const user: User = {
      id: makeId("USR"),
      name,
      email,
      phone,
      walletBalance: Number(walletBalance) || 0,
    };

    const db = await getDb();
    await db.collection<User>("users").insertOne(user);

    const wallet: Wallet = {
      userId: user.id,
      balance: user.walletBalance,
      currency: "GHS",
      lastUpdated: new Date().toISOString(),
    };
    await db.collection<Wallet>("wallets").updateOne(
      { userId: user.id },
      { $set: wallet },
      { upsert: true }
    );

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}
