import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const users = await User.find({ walletBalance: { $exists: true } });
    
    const wallets = users.map(u => ({
      userId: u._id.toString(),
      balance: u.walletBalance,
      currency: "GHS",
      lastUpdated: u.updatedAt.toISOString()
    }));

    return NextResponse.json(wallets);
  } catch (error) {
    console.error("Wallet list error:", error);
    return NextResponse.json({ message: "Error fetching wallets" }, { status: 500 });
  }
}
