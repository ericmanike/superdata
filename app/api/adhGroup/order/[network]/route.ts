import { NextResponse } from "next/server";
import { placeADHOrder, ADHOrderPayload } from "@/lib/adhgroupAPIs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ network: string }> }
) {
  try {
    const { network } = await params;
    const body: ADHOrderPayload = await req.json();

    if (!body.phone || !body.offerSlug || !body.volume) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: phone, offerSlug, or volume" },
        { status: 400 }
      );
    }

    const response = await placeADHOrder(network, body);
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("ADH Place Order Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to place ADH order" },
      { status: 500 }
    );
  }
}
