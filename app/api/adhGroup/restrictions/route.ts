import { NextResponse } from "next/server";
import { getADHRestrictions } from "@/lib/adhgroupAPIs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const offerSlug = searchParams.get("offerSlug") || undefined;

    const data = await getADHRestrictions(offerSlug);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("ADH Restrictions Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch ADH restrictions" },
      { status: 500 }
    );
  }
}
