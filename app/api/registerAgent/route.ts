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
    if(session.user.role == "admin"){
        console.log("Admin cannot register as an agent")
        return NextResponse.json({ message: "Admin cannot register as an agent" }, { status: 400 });
    }

    try {
        await dbConnect();
        const { reference } = await req.json();
        const email = session.user.email;

        if (!email) {
            return NextResponse.json({ message: "User email not found in session" }, { status: 400 });
        }

        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
        const upgradeFee = 30;
        const totalAmount = upgradeFee * 1.02; // 30 GHS + 2% fees

        const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const paystackData = await verifyResponse.json();

        if (!paystackData.status || paystackData.data.status !== 'success') {
            return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
        }

        const amountInGHS = paystackData.data.amount / 100;
        // Check if the amount paid covers the fee
        if (amountInGHS < totalAmount - 0.1) {
            return NextResponse.json({ message: "Payment amount does not match" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.role === "admin") {
            return NextResponse.json({ message: "Admin role cannot be downgraded" }, { status: 400 });
        }

        if (user.role !== "agent") {
            user.role = "agent";
            await user.save();
        }
        console.log("User role updated to agent", session.user.role)  
        return NextResponse.json({ message: "Agent registered successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Register agent error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}