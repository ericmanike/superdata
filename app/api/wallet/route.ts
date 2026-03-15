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
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      balance: user.walletBalance || 0,
      currency: "GHS",
      lastUpdated: user.updatedAt || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json({ message: "Error fetching wallet" }, { status: 500 });
  }
}
