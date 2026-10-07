import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const query = session.user.role === "admin" ? {} : { user: session.user.id };

    // Fetch ONLY Transaction model records (wallet topups, deposits, adjustments)
    const txRecords = await Transaction.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    const formattedTx = txRecords.map((t: any) => ({
      id: (t.reference || "TX").toUpperCase(),
      userId: typeof t.user === "object" ? t.user?.email || t.user?._id?.toString() : t.user?.toString() || "Guest",
      userName: typeof t.user === "object" ? t.user?.name || t.user?.email : "Guest",
      network: "Wallet Top-up",
      phone: t.paymentMethod?.toUpperCase() || "MOOLRE",
      bundle: t.type === "topup" ? "Wallet Topup" : t.type,
      amount: t.amount,
      status: t.status === "success" ? "Success" : t.status === "failed" ? "Failed" : "Pending",
      date: t.createdAt.toISOString(),
      type: "topup",
      paymentMethod: t.paymentMethod || "moolre",
      description: t.description || "Wallet deposit",
    }));

    return NextResponse.json(formattedTx);
  } catch (error: any) {
    console.error("Transaction list error:", error);
    return NextResponse.json({ message: "Error fetching transactions", details: error?.message }, { status: 500 });
  }
}
