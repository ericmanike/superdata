import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pollMoolreTransactionStatus } from "@/lib/moolre";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { reference, amount } = await req.json();

    if (!reference) {
      return NextResponse.json({ message: "Transaction reference is required" }, { status: 400 });
    }

    const topupAmount = Number(amount);
    if (!topupAmount || topupAmount <= 0) {
      return NextResponse.json({ message: "Invalid top-up amount" }, { status: 400 });
    }

    // Verify transaction status with Moolre using polling (up to 10 attempts with a 2.5s delay)
    console.log(`Verifying Moolre wallet top-up for reference: [${reference}]`);
    const moolreStatus = await pollMoolreTransactionStatus(
      {
        id: String(reference),
        type: 1,
        idtype: "2",
      },
      10,
      2500
    );

    console.log("Moolre Wallet Top-up Status response:", moolreStatus);

    const isSuccess =
      moolreStatus?.status === 1 &&
      (moolreStatus?.data?.txstatus === 1 ||
        moolreStatus?.data?.txstatus === "1" ||
        moolreStatus?.data?.txstatus === "success" ||
        typeof moolreStatus?.data?.txstatus === "undefined");

    if (!isSuccess) {
      return NextResponse.json(
        {
          message:
            moolreStatus?.message ||
            moolreStatus?.error ||
            "Moolre payment verification failed or timed out",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Credit the top-up amount to the user's wallet balance
    user.walletBalance = (user.walletBalance || 0) + topupAmount;
    await user.save();

    console.log(
      `💰 Wallet top-up successful for User [${user._id}]: +${topupAmount}. New balance: ₵${user.walletBalance}`
    );

    return NextResponse.json(
      {
        message: "Wallet top-up successful!",
        newBalance: user.walletBalance,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Wallet top-up error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error during wallet top-up" },
      { status: 500 }
    );
  }
}
