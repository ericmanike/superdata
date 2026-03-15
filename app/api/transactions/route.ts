import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/lib/models/Order";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    let query = {};
    if (session.user.role !== 'admin') {
      query = { user: session.user.id };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    const transactions = orders.map(o => ({
      id: "TX-" + o.transaction_id.toUpperCase(),
      userId: o.user?.toString() || "Guest",
      network: o.network,
      phone: o.phoneNumber,
      bundle: o.bundleName,
      amount: o.price,
      status: o.status === 'delivered' ? 'Success' : o.status === 'failed' ? 'Failed' : 'Pending',
      date: o.createdAt.toISOString()
    }));

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Transaction list error:", error);
    return NextResponse.json({ message: "Error fetching transactions" }, { status: 500 });
  }
}
