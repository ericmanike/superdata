import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId, role, walletBalance, name, phone } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (role !== undefined) {
            user.role = role;
        }
        if (walletBalance !== undefined && typeof walletBalance === 'number') {
            user.walletBalance = walletBalance;
        }
        if (name !== undefined) {
            user.name = name;
        }
        if (phone !== undefined) {
            user.phone = phone;
        }

        await user.save();

        return NextResponse.json({
            message: "User updated successfully",
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                walletBalance: user.walletBalance
            }
        });
    } catch (error: any) {
        console.error("Update user error:", error);
        return NextResponse.json({ message: error?.message || "Error updating user" }, { status: 500 });
    }
}
