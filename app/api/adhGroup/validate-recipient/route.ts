import { NextResponse } from "next/server";
import { validateADHRecipient, ADHValidateRecipientPayload } from "@/lib/adhgroupAPIs";

export async function POST(req: Request) {
  try {
    const body: ADHValidateRecipientPayload = await req.json();

    if (!body.phone || !body.offerSlug) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: phone or offerSlug" },
        { status: 400 }
      );
    }

    const result = await validateADHRecipient(body);
    console.log("result", result);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("ADH Validate Recipient Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to validate recipient" },
      { status: 500 }
    );
  }
}
