import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import { MoolreWebhookPayload } from "@/lib/moolre";

export async function POST(req: NextRequest) {
  try {
    const payload: MoolreWebhookPayload = await req.json().catch(() => null);

    console.log("🔔 Received Moolre Webhook:", JSON.stringify(payload, null, 2));

    if (!payload || typeof payload.status === "undefined") {
      return NextResponse.json(
        { status: 0, message: "Invalid or empty webhook payload" },
        { status: 400 }
      );
    }

    const { status, code, message, data } = payload;

    const reference =
      data?.externalref ||
      data?.external_ref ||
      data?.reference ||
      data?.externalRef ||
      data?.id;

    if (!reference) {
      console.warn("⚠️ Moolre Webhook received without reference/externalref in data.");
      return NextResponse.json(
        { status: 0, message: "Missing transaction reference" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1 for success according to Moolre API spec
    const isSuccess =
      (status === 1 || status === "1") &&
      (data?.txstatus === 1 || data?.txstatus === "1" || typeof data?.txstatus === "undefined");

    console.log(`Processing Moolre callback for reference [${reference}]. Status: ${status}, isSuccess: ${isSuccess}`);

    // Check if reference belongs to an Order
    const order = await Order.findOne({
      $or: [
        { transaction_id: reference },
        { transaction_id: `Paid_${reference}` },
        { transaction_id: `paymentflaged_${reference}` },
        { transaction_id: { $regex: reference, $options: "i" } },
      ],
    });

    if (order) {
      if (isSuccess) {
        // If order was marked as flagged due to initial verification mismatch, unflag it
        if (order.transaction_id.startsWith("paymentflaged_")) {
          order.transaction_id = `Paid_${reference}`;
        }
        
        // If order was failed or pending, update as needed
        if (order.status === "failed") {
          order.status = "pending";
        }

        await order.save();
        console.log(`✅ Order [${order._id}] updated via Moolre Webhook. Status: ${order.status}`);
      } else {
        order.status = "failed";
        await order.save();
        console.log(`❌ Order [${order._id}] marked as failed via Moolre Webhook.`);
      }

      return NextResponse.json({
        status: 1,
        code: code || "P01",
        message: "Webhook processed successfully for Order",
        orderId: order._id.toString(),
      });
    }

    // Check if reference belongs to a Wallet Topup
    if (reference.startsWith("wallet_") || reference.startsWith("topup_")) {
      const parts = reference.split("_");
      const userId = parts.length > 2 ? parts[2] : null;

      if (userId && isSuccess && data?.amount) {
        const topupAmount = Number(data.amount);
        const user = await User.findById(userId);

        if (user) {
          user.walletBalance = (user.walletBalance || 0) + topupAmount;
          await user.save();
          console.log(`💰 Wallet topup processed via Moolre Webhook for User [${userId}]: +${topupAmount}. New balance: ${user.walletBalance}`);

          return NextResponse.json({
            status: 1,
            code: code || "P01",
            message: "Wallet topup processed successfully",
            newBalance: user.walletBalance,
          });
        }
      }
    }

    console.log(`ℹ️ Moolre Webhook received for reference [${reference}], but no matching Order or User was found.`);

    return NextResponse.json({
      status: 1,
      code: code || "P01",
      message: "Webhook received and logged",
      reference,
    });
  } catch (error: any) {
    console.error("❌ Error processing Moolre Webhook:", error);
    return NextResponse.json(
      { status: 0, message: "Internal server error processing webhook", details: error.message },
      { status: 500 }
    );
  }
}
