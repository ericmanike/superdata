import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import Bundle from "@/lib/models/Bundle";
import Setting from "@/lib/models/Setting";
import { placeADHOrder } from "@/lib/adhgroupAPIs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { network, bundleName, price, phoneNumber } = await req.json();

    console.log("Received wallet purchase data:", { network, bundleName, price, phoneNumber });

    if (!network || !bundleName || !price || !phoneNumber) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Verify real price from Bundle collection
    const bundleQueryName = String(bundleName).toUpperCase().endsWith("GB") ? bundleName : `${bundleName}GB`;
    const dbPrice = await Bundle.findOne({
      name: bundleQueryName,
      network: network.toUpperCase(),
      audience: session.user.role === "user" ? "user" : "agent",
      isActive: true,
    }).select("price");

    console.log("Database price fetched:", dbPrice);
    const realPrice = dbPrice ? dbPrice.price : null;

    if (realPrice === null) {
      return NextResponse.json({ message: "Bundle not found" }, { status: 404 });
    }

    // Get user and check wallet balance
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if ((user.walletBalance || 0) < realPrice) {
      return NextResponse.json(
        {
          message: "Insufficient wallet balance",
          balance: user.walletBalance || 0,
          required: realPrice,
        },
        { status: 400 }
      );
    }

    // Deduct from wallet balance atomically
    const updatedUser = await User.findOneAndUpdate(
      { _id: session.user.id, walletBalance: { $gte: realPrice } },
      { $inc: { walletBalance: -realPrice } },
      { new: true }
    );

    if (!updatedUser) {
      console.log("Insufficient balance during update. Cancelling transaction.");
      return NextResponse.json(
        { message: "Insufficient wallet balance. Transaction cancelled." },
        { status: 400 }
      );
    }

    console.log(`Deducted ₵${realPrice} from wallet. New balance: ₵${updatedUser.walletBalance}`);

    // Create pending order record first
    const order = await Order.create({
      user: session.user.id,
      transaction_id: `wallet_${Date.now()}_${session.user.id}`,
      network: network,
      bundleName: bundleName,
      price: realPrice,
      phoneNumber: phoneNumber,
      status: "pending",
    });

    // Fetch active provider setting ('dakazina' or 'adhGroup')
    const providerSetting = await Setting.findOne({ key: "activeProvider" });
    const activeProvider = providerSetting?.value || "dakazina";
    console.log("Fulfilling wallet order via active provider:", activeProvider);

    if (activeProvider === "adhGroup") {
      let adhNetwork = "mtn";
      let offerSlug = "mtn_data_bundle";
      const upperNet = network.toUpperCase();

      if (upperNet === "MTN") {
        adhNetwork = "mtn";
        offerSlug = "mtn_data_bundle";
      } else if (upperNet === "TELECEL") {
        adhNetwork = "telecel";
        offerSlug = "telecel_data_bundle";
      } else if (upperNet.startsWith("AT") || upperNet.includes("AIRTEL")) {
        adhNetwork = "at";
        offerSlug = "at_data_bundle";
      }

      const numericVolume = parseFloat(String(bundleName).replace(/[^0-9.]/g, "")) || 1;

      try {
        const adhRes = await placeADHOrder(adhNetwork, {
          type: "single",
          volume: numericVolume,
          phone: phoneNumber.trim(),
          offerSlug: offerSlug,
        });

        console.log("ADH Order response:", adhRes);
        if (adhRes.success) {
          const transaction_id = adhRes.orderId || adhRes.reference || `ADH_${Date.now()}`;
          await Order.findByIdAndUpdate(order._id, { transaction_id });
          console.log("📦 New ADH wallet order created:", order);

          return NextResponse.json(
            {
              message: "Order created successfully",
              order,
              newBalance: updatedUser.walletBalance,
            },
            { status: 201 }
          );
        } else {
          console.error("ADH Order failed:", adhRes);
          // Refund wallet balance
          await User.findByIdAndUpdate(session.user.id, { $inc: { walletBalance: realPrice } });
          await Order.findByIdAndUpdate(order._id, { status: "failed" });
          return NextResponse.json(
            { error: adhRes.message || adhRes.error || "Could not place order with ADH Group. Wallet refunded." },
            { status: 500 }
          );
        }
      } catch (adhErr: any) {
        console.error("ADH Order error:", adhErr);
        // Refund wallet balance
        await User.findByIdAndUpdate(session.user.id, { $inc: { walletBalance: realPrice } });
        await Order.findByIdAndUpdate(order._id, { status: "failed" });
        return NextResponse.json(
          { error: adhErr.message || "Failed to contact ADH Group provider. Wallet refunded." },
          { status: 500 }
        );
      }
    } else {
      // Default / Dakazina Provider
      const DAKAZI_API_KEY = process.env.DAKAZI_API_KEY;
      if (!DAKAZI_API_KEY) {
        // Refund wallet balance
        await User.findByIdAndUpdate(session.user.id, { $inc: { walletBalance: realPrice } });
        await Order.findByIdAndUpdate(order._id, { status: "failed" });
        return NextResponse.json({ message: "Data provider API key missing. Wallet refunded." }, { status: 500 });
      }

      let networkId;
      const upperNet = network.toUpperCase();
      if (upperNet === "MTN") {
        networkId = 3;
      } else if (upperNet === "TELECEL") {
        networkId = 2;
      } else if (upperNet.startsWith("AT") || upperNet.includes("AIRTEL")) {
        networkId = 4;
      } else {
        // Refund wallet balance
        await User.findByIdAndUpdate(session.user.id, { $inc: { walletBalance: realPrice } });
        await Order.findByIdAndUpdate(order._id, { status: "failed" });
        return NextResponse.json({ message: "Invalid network. Wallet refunded." }, { status: 400 });
      }

      const placeOrder = await fetch("https://reseller.dakazinabusinessconsult.com/api/v1/buy-data-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${DAKAZI_API_KEY}`,
        },
        body: JSON.stringify({
          recipient_msisdn: phoneNumber.trim(),
          network_id: networkId,
          shared_bundle: parseInt(bundleName),
          incoming_api_ref: order.transaction_id,
        }),
      });

      const orderRes = await placeOrder.json().catch(() => ({}));
      console.log("Raw response from Dakazi:", orderRes);

      if (!placeOrder.ok) {
        // Refund wallet balance
        await User.findByIdAndUpdate(session.user.id, { $inc: { walletBalance: realPrice } });
        await Order.findByIdAndUpdate(order._id, { status: "failed" });
        return NextResponse.json(
          { error: orderRes.message || "Could not place order with Dakazi. Wallet refunded." },
          { status: 500 }
        );
      }

      const transaction_id = orderRes.transaction_code || `TXT-${Date.now()}`;
      await Order.findByIdAndUpdate(order._id, { transaction_id });

      console.log("📦 New Dakazi wallet order created:", order);
      return NextResponse.json(
        {
          message: "Order created successfully",
          order,
          newBalance: updatedUser.walletBalance,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Wallet purchase error:", error);
    return NextResponse.json({ message: "Error processing wallet purchase", details: error?.message }, { status: 500 });
  }
}
