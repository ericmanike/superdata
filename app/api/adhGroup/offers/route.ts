import { NextResponse } from "next/server";
import { getADHOffers } from "@/lib/adhgroupAPIs";

export async function GET() {
  try {
    const data = await getADHOffers();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching ADH Group offers:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch ADH Group offers",
      },
      { status: 500 }
    );
  }
}
