import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const { reference, amount } = await req.json();
        const email = session.user.email;

        if (!email) {
            return NextResponse.json({ message: "User email not found in session" }, { status: 400 });
        }

        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
        const feePercentage = 0.02;
        const totalExpectedAmount = amount * (1 + feePercentage);

        // Verify with Paystack
        const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const paystackData = await verifyResponse.json();

        if (!paystackData.status || paystackData.data.status !== 'success') {
            return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
        }

        const paidAmountGHS = paystackData.data.amount / 100;
        // Verify the amount paid matches the top-up amount + fee
        if (paidAmountGHS < totalExpectedAmount - 0.1) {
            return NextResponse.json({ message: "Payment amount does not match" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Add the top-up amount to the user's wallet balance
        user.walletBalance = (user.walletBalance || 0) + amount;
        await user.save();

        console.log(`Wallet top-up successful for ${email}: +${amount}. New balance: ${user.walletBalance}`);

        return NextResponse.json({ 
            message: "Wallet top-up successful", 
            newBalance: user.walletBalance 
        }, { status: 200 });

    } catch (error: any) {
        console.error("Wallet top-up error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
