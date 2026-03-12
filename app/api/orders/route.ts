import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import type { Bundle, Order, Transaction, User, Wallet } from "@/app/lib/mockData";

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function GET() {
  const db = await getDb();
  const orders = await db
    .collection<Order>("orders")
    .find({})
    .sort({ date: -1 })
    .toArray();
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, bundleId, phone } = body ?? {};

    if (!userId || !bundleId) {
      return NextResponse.json(
        { error: "userId and bundleId are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection<User>("users");
    const bundlesCollection = db.collection<Bundle>("bundles");
    const ordersCollection = db.collection<Order>("orders");
    const transactionsCollection = db.collection<Transaction>("transactions");
    const walletsCollection = db.collection<Wallet>("wallets");

    const user = await usersCollection.findOne({ id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bundle = await bundlesCollection.findOne({ id: bundleId });
    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    const order: Order = {
      id: makeId("ORD"),
      userId: user.id,
      bundleId: bundle.id,
      phone: phone ?? user.phone,
      status: "Processing",
      date: new Date().toISOString(),
      network: bundle.network,
      bundle: bundle.size,
      amount: bundle.price,
    };

    await ordersCollection.insertOne(order);

    const transaction: Transaction = {
      id: makeId("TX"),
      userId: user.id,
      network: bundle.network,
      phone: order.phone,
      bundle: bundle.size,
      amount: bundle.price,
      status: "Pending",
      date: order.date,
    };
    await transactionsCollection.insertOne(transaction);

    await walletsCollection.updateOne(
      { userId: user.id },
      {
        $inc: { balance: -bundle.price },
        $setOnInsert: { currency: "GHS" },
        $set: { lastUpdated: order.date },
      },
      { upsert: true }
    );

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}
