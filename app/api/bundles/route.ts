import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Bundle from "@/lib/models/Bundle";
import { Console } from "console";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("Unauthorized NO SESSION");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    }

    await dbConnect();
    const bundles = await Bundle.find({});
    console.log(`Found ${bundles.length} bundles in database`);

    const normalizedBundles = bundles.map((b: any) => ({
      id: (b._id || b.id)?.toString(),
      network: b.network || "MTN",
      size: b.name || b.size || "Standard",
      network_short: b.network_short || "",
      price: b.price || 0,
      audience: b.audience || "user"
    }));

    return NextResponse.json(normalizedBundles);
  } catch (error) {
    console.error("Bundle list error:", error);
    return NextResponse.json({ message: "Error fetching bundles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();
    // Map 'size' from form to 'name' for model
    const bundleData = {
      ...body,
      name: body.size,
      network_short: body.network_short || "",
    };
    const bundle = await Bundle.create(bundleData);
    return NextResponse.json(bundle, { status: 201 });
  } catch (error) {
    console.error("Bundle creation error:", error);
    return NextResponse.json({ message: "Error creating bundle" }, { status: 500 });
  }
}
