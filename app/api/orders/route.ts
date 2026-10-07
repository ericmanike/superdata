import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/lib/models/Order";
import Setting from "@/lib/models/Setting";
import { checkMoolreTransactionStatus, pollMoolreTransactionStatus } from "@/lib/moolre";
import { placeADHOrder } from "@/lib/adhgroupAPIs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const query = session.user.role === 'admin' ? {} : { user: session.user.id };

    const rawOrders = await Order.find(query).sort({ createdAt: -1 });

    const orders = rawOrders.map(o => ({
      id: o._id.toString(),
      userId: o.user?.toString() || "Guest",
      network: o.network,
      bundle: o.bundleName,
      amount: o.price,
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1), // Capitalize
      date: o.createdAt.toISOString(),
      phone: o.phoneNumber,
      transactionId: o.transaction_id
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Order list error:", error);
    return NextResponse.json({ message: "Error fetching orders" }, { status: 500 });
  }
}




export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { orderId } = await req.json();
        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        await dbConnect();
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Handle retry for Dakazi failed orders (transaction_id starts with "paid_")
        if (order.transaction_id.toLowerCase().startsWith('paid_')) {
            const DAKAZI_API_KEY = process.env.DAKAZI_API_KEY;
            if (!DAKAZI_API_KEY) {
                return NextResponse.json({ error: 'Data provider API key not configured' }, { status: 500 });
            }

            const network = order.network;
            let networkId;
            const upperNetwork = network.toUpperCase();
            if (upperNetwork === "MTN") {
                networkId = 3;
            } else if (upperNetwork === "TELECEL") {
                networkId = 2;
            } else if (upperNetwork.startsWith("AT") || upperNetwork.includes("AIRTEL")) {
                networkId = 4;
            }

            if (networkId) {
                const originalRef = order.transaction_id.replace(/^paid_/i, '');
                try {
                    const placeOrder = await fetch(
                        "https://reseller.dakazinabusinessconsult.com/api/v1/buy-data-package",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "x-api-key": `${DAKAZI_API_KEY}`,
                            },
                            body: JSON.stringify({
                                recipient_msisdn: order.phoneNumber.trim(),
                                network_id: networkId,
                                shared_bundle: Number(order.bundleName),
                                incoming_api_ref: originalRef
                            })
                        }
                    );

                    const orderRes = await placeOrder.json().catch(() => ({}));
                    console.log("Admin reordered unsuccessful order", orderRes);
                    if (orderRes.transaction_code) {
                        order.transaction_id = orderRes.transaction_code;
                        order.status = 'pending';
                        await order.save();
                        return NextResponse.json({ success: true, order });
                    } else {
                        return NextResponse.json({ error: orderRes.message || 'Data provider error' }, { status: 400 });
                    }
                } catch (err) {
                    console.error('Retry order error:', err);
                    return NextResponse.json({ error: 'Failed to contact data provider' }, { status: 500 });
                }
            } else {
                return NextResponse.json({ error: 'Could not determine network for retry' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ error: 'Order is not in a retryable state (ID doesn\'t start with paid_)' }, { status: 400 });
        }
    } catch (error: any) {
        console.error("PATCH error:", error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}







export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

  

    const body = await req.json();
    const { network, bundleName, price, phoneNumber, reference, paymentMethod } = body;

    console.log('Received data:', { network, bundleName, price, phoneNumber, reference, paymentMethod });

    if (!network || !bundleName || !price || !phoneNumber || !reference) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // prevent replay attack
    const existingOrder = await Order.findOne({ transaction_id: reference });
    if (existingOrder) {
      return NextResponse.json({ message: "Duplicate transaction reference" }, { status: 409 });
    }     

  

     const order = await Order.create({
      user: session.user.id,
      transaction_id: "Paid_"+reference,
      network: network,
      bundleName: bundleName,
      price: price,
      phoneNumber: phoneNumber,
      status: 'pending',
    });

    // Fetch active provider setting ('dakazina' or 'adhGroup')
    const providerSetting = await Setting.findOne({ key: "activeProvider" });
    const activeProvider = providerSetting?.value || "dakazina";
    console.log("Fulfilling order via active provider:", activeProvider);

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
          console.log("📦 New ADH order created:", order);
          return NextResponse.json({ message: "Order created successfully", order }, { status: 201 });
        } else {
          console.error("ADH Order failed:", adhRes);
          return NextResponse.json({ error: adhRes.message || adhRes.error || "Could not place order with ADH Group" }, { status: 500 });
        }
      } catch (adhErr: any) {
        console.error("ADH Order error:", adhErr);
        return NextResponse.json({ error: adhErr.message || "Failed to contact ADH Group provider" }, { status: 500 });
      }
    } else if (activeProvider === "dakazina") {

    const DAKAZI_API_KEY = process.env.DAKAZI_API_KEY;
    if (!DAKAZI_API_KEY) {
      return NextResponse.json({ message: "unexpected error occurred" }, { status: 500 });
    }

    let networkId;
    if (network.toUpperCase() === "MTN") {
      networkId = 3;
    } else if (network.toUpperCase() === "TELECEL") {
      networkId = 2;
    } else if (network.toUpperCase().startsWith("AT") || network.toUpperCase().includes("AIRTEL")) {
      networkId = 4;
    } else {
      return NextResponse.json({ message: "Invalid network" }, { status: 400 });
    }

    console.log('Network ID:', networkId);
    if (!networkId) {
      return NextResponse.json({ message: "Invalid network" }, { status: 400 });
    }
      // Fulfill via Dakazi API
      const placeOrder = await fetch(
        "https://reseller.dakazinabusinessconsult.com/api/v1/buy-data-package",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": `${DAKAZI_API_KEY}`,
          },
          body: JSON.stringify({
            recipient_msisdn: phoneNumber,
            network_id: networkId,
            shared_bundle: parseInt(bundleName),
            incoming_api_ref: reference,
          }),
        }
      );

      const Orderres = await placeOrder.json().catch(() => ({}));
      console.log("Raw response from Dakazi:", Orderres);

      if (!placeOrder.ok) {
        return NextResponse.json({ error: Orderres.message || "Could not place order with Dakazi" }, { status: 500 });
      }

      const transaction_id = Orderres.transaction_code || `TXT - ${Date.now()}`;
      await Order.findByIdAndUpdate(order._id, { transaction_id });

      console.log("📦 New Dakazi order created:", order);
      return NextResponse.json({ message: "Order created successfully", order }, { status: 201 });
    }
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ message: "Error creating order" }, { status: 500 });
  }
}
