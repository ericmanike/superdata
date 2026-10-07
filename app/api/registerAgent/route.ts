import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
  }

  if (session.user.role === "admin") {
    return NextResponse.json({ message: "Admin role cannot be modified." }, { status: 400 });
  }

  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const userId = session.user.id;
    const email = session.user.email || body.email;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role === "agent") {
      return NextResponse.json({ message: "You are already registered as an agent.", role: "agent" }, { status: 200 });
    }


    // 2. Wallet Balance Upgrade Option (Standard Upgrade Fee: 30 GHS)
    const UPGRADE_FEE = 30;
    const currentBalance = user.walletBalance || 0;

    if (currentBalance >= UPGRADE_FEE) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id, walletBalance: { $gte: UPGRADE_FEE } },
        {
          $inc: { walletBalance: -UPGRADE_FEE },
          $set: { role: "agent" },
        },
        { returnDocument: "after" }
      );

      if (updatedUser) {
        await Transaction.create({
          user: user._id,
          reference: `upgrade_${Date.now()}_${user._id}`,
          amount: UPGRADE_FEE,
          type: "upgrade",
          paymentMethod: "wallet",
          status: "success",
          description: "Agent account upgrade fee deducted from wallet balance",
        });

        return NextResponse.json(
          {
            message: "Successfully upgraded to Agent status!",
            role: "agent",
            newBalance: updatedUser.walletBalance,
          },
          { status: 200 }
        );
      }
    }

    // 3. Insufficient balance fallback message
    return NextResponse.json(
      {
        message: `Insufficient wallet balance. An upgrade fee of ₵${UPGRADE_FEE.toFixed(2)} is required (Current balance: ₵${currentBalance.toFixed(2)}). Please top up your wallet first.`,
        requiredAmount: UPGRADE_FEE,
        currentBalance: currentBalance,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Register agent error:", error);
    return NextResponse.json({ message: "Internal server error", error: error?.message }, { status: 500 });
  }
}