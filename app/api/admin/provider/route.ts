import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Setting from "@/lib/models/Setting";

export async function GET() {
  try {
    await dbConnect();
    const setting = await Setting.findOne({ key: "activeProvider" });
    let activeProvider = setting?.value || "dakazina";
    if (activeProvider === "dakazi") activeProvider = "dakazina";
    return NextResponse.json({ activeProvider });
  } catch (error: any) {
    console.error("GET active provider error:", error);
    return NextResponse.json(
      { activeProvider: "dakazina", error: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let { provider } = await req.json();
    if (provider === "dakazi") provider = "dakazina";

    if (!provider || !["dakazina", "adhGroup"].includes(provider)) {
      return NextResponse.json(
        { message: "Invalid provider. Must be 'dakazina' or 'adhGroup'." },
        { status: 400 }
      );
    }

    await dbConnect();
    const updatedSetting = await Setting.findOneAndUpdate(
      { key: "activeProvider" },
      { value: provider },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: `Active provider updated to ${provider}`,
      activeProvider: updatedSetting.value,
    });
  } catch (error: any) {
    console.error("Update provider error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update active provider" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  return POST(req);
}

