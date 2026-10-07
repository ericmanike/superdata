import { NextResponse } from "next/server";
import { getADHBalance } from "@/lib/adhgroupAPIs";

export async function GET() {
  try {
    const data = await getADHBalance();
    console.log(data);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching ADH Group balance:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch ADH Group balance" },
      { status: 500 }
    );
  }
}
