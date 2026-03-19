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

    // Optional: Check if the user is an admin
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    // }

    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 });
    
    // Normalize for the interface
    const normalizedUsers = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone || "N/A",
      role: u.role || "user",
      walletBalance: u.walletBalance
    }));

    return NextResponse.json(normalizedUsers);
  } catch (error) {
    console.error("User list error:", error);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    await dbConnect();
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ message: "Error deleting user" }, { status: 500 });
  }
}
