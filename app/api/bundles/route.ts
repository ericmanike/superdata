import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import type { Bundle, Network } from "@/app/lib/mockData";

const allowedNetworks: Network[] = ["MTN", "Telecel", "AirtelTigo"];

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function GET() {
  const db = await getDb();
  const bundles = await db
    .collection<Bundle>("bundles")
    .find({})
    .sort({ network: 1, price: 1 })
    .toArray();

  return NextResponse.json(bundles);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { network, size, price } = body ?? {};

    if (!network || !size || typeof price !== "number") {
      return NextResponse.json(
        { error: "network, size and numeric price are required" },
        { status: 400 }
      );
    }

    if (!allowedNetworks.includes(network)) {
      return NextResponse.json(
        { error: "Unsupported network" },
        { status: 400 }
      );
    }

    const bundle: Bundle = {
      id: makeId("BND"),
      network,
      size,
      price: Number(price),
    };

    const db = await getDb();
    await db.collection<Bundle>("bundles").insertOne(bundle);

    return NextResponse.json(bundle, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}
