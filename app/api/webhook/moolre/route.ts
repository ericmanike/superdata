import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import { MoolreWebhookPayload } from "@/lib/moolre";

/**
 * Moolre Payment Webhook Handler
 * Endpoint: POST /api/webhook/moolre
 * Docs: https://docs.moolre.com/ai/payment-webhook.html
 */
export async function POST(req: NextRequest) {
  try {
    const payload: MoolreWebhookPayload = await req.json().catch(() => null);

    console.log("🔔 Received Moolre Payment Webhook:", JSON.stringify(payload, null, 2));

    if (!payload || typeof payload.status === "undefined" || !payload.data) {
      return NextResponse.json(
        { status: 0, message: "Invalid or empty webhook payload" },
        { status: 400 }
      );
    }

    const { status, code, data } = payload;

    // External Reference from Moolre webhook data
    const reference = data?.externalref;

    if (!reference) {
      console.warn("⚠️ Moolre Webhook received without externalref in data.");
      return NextResponse.json(
        { status: 0, message: "Missing transaction externalref" },
        { status: 400 }
      );
    }

    await dbConnect();

    // According to Moolre API spec:
    // status === 1 (or "1") AND txstatus === 1 (or "1") represents a successful transaction
    const isOverallSuccess = status === 1 || status === "1";
    const isTxSuccess = data.txstatus === 1 || data.txstatus === "1";
    const isSuccess = isOverallSuccess && isTxSuccess;

    console.log(
      `Processing Moolre callback for externalref [${reference}]. Overall status: ${status}, txstatus: ${data.txstatus}, isSuccess: ${isSuccess}`
    );

    // Process Wallet Topups (reference starts with "topup_" or "wallet_")
    if (reference.startsWith("topup_") || reference.startsWith("wallet_")) {
      const parts = reference.split("_");
      // Extract userId (supports both "topup_USERID" and "topup_TIMESTAMP_USERID")
      const userId = parts.length >= 2 ? parts[parts.length - 1] : null;

      const rawAmount = data.value ?? data.amount;
      const topupAmount = Number(rawAmount);

      if (userId && isSuccess && topupAmount > 0) {
        // Idempotency check: ensure this reference hasn't already been credited in Transaction model
        const existingTransaction = await Transaction.findOne({ reference });
        if (existingTransaction) {
          console.log(`ℹ️ Wallet top-up reference [${reference}] already processed in Transaction model.`);
          return NextResponse.json({
            status: 1,
            code: code || "P01",
            message: "Wallet topup reference already processed",
          });
        }

        // Perform ATOMIC increment on User walletBalance
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $inc: { walletBalance: topupAmount } },
          { new: true }
        );

        if (updatedUser) {
          // Record top-up in Transaction model
          await Transaction.create({
            user: userId,
            reference: reference,
            amount: topupAmount,
            type: "topup",
            paymentMethod: "moolre",
            status: "success",
            description: `Wallet top-up via Moolre (payer: ${data.payer || "N/A"})`,
            metadata: {
              payer: data.payer,
              moolreTxId: data.transactionid,
              accountnumber: data.accountnumber,
              ts: data.ts,
            },
          });

          console.log(
            `💰 Wallet topup processed atomically into Transaction model for User [${userId}]: +₵${topupAmount}. New balance: ₵${updatedUser.walletBalance}`
          );

          return NextResponse.json({
            status: 1,
            code: code || "P01",
            message: "Wallet topup processed successfully",
            newBalance: updatedUser.walletBalance,
          });
        } else {
          console.warn(`⚠️ User [${userId}] not found during Moolre wallet topup webhook processing.`);
        }
      }
    }

    console.log(`ℹ️ Moolre Webhook received for externalref [${reference}], logged without error.`);

    return NextResponse.json({
      status: 1,
      code: code || "P01",
      message: "Webhook received and logged successfully",
      externalref: reference,
    });
  } catch (error: any) {
    console.error("❌ Error processing Moolre Webhook:", error);
    return NextResponse.json(
      { status: 0, message: "Internal server error processing webhook", details: error.message },
      { status: 500 }
    );
  }
}
