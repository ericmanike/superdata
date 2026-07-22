import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/lib/models/Order";


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

    // const ip = session.user.id;
    // console.log(  'order rate limit identifier:', ip)
    // const { success } = await orderRateLimit.limit(ip);

    // if (!success) {
    //   return NextResponse.json({ message: "Too many order attempts. Please try again later." }, { status: 429 });
    // }

    const { network, bundleName, price, phoneNumber, reference } = await req.json();

    console.log('Received data:', { network, bundleName, price, phoneNumber, reference });

    if (!network || !bundleName || !price || !phoneNumber || !reference) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // prevent replay attack
    const existingOrder = await Order.findOne({ transaction_id: reference });
    if (existingOrder) {
      return NextResponse.json({ message: "Duplicate transaction reference" }, { status: 409 });
    }     
    

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
    const DAKAZI_API_KEY = process.env.DAKAZI_API_KEY

    if (!PAYSTACK_SECRET_KEY || !DAKAZI_API_KEY) {
      //console.log('Paystack secret key not found')
      return NextResponse.json({ message: "unexpected error occurred" }, { status: 500 });
    }

    let networkId;
    if (network === "MTN") {
      networkId = 3;
    } else if (network === "TELECEL") {
      networkId = 2;
    } else if (network.startsWith("AT")) {
      networkId = 4;
    } else {
      return NextResponse.json({ message: "Invalid network" }, { status: 400 });
    }

    console.log('Network ID:', networkId);
    if (!networkId) {
      return NextResponse.json({ message: "Invalid network" }, { status: 400 });
    }



    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const paystackData = await verifyResponse.json()

    //  console.log('Payment verification response:', paystackData)
    if (!paystackData.data) {
      console.log('Payment verification failed no data')
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
    }

    const { amount } = paystackData.data
    
            const tax = 0.02 * price
            let total = price + tax
            console.log('Total before rounding:', total)
            total = Math.round(total * 100)/100
            console.log('Total after rounding:', total)
 
       console.log('Payment amount:', amount / 100)

    if (amount / 100 !== Number(total)) {
      console.log('Payment amount does not match')
      return NextResponse.json({ message: "Payment amount does not match" }, { status: 400 });
    }

     if (paystackData.data.status !== 'success') {
      console.log('Payment verification failed')
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
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

    //place order
    // const placeOrder = await fetch(
    //   "https://reseller.dakazinabusinessconsult.com/api/v1/buy-data-package",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "x-api-key": `${DAKAZI_API_KEY}`,
    //     },
    //     body: JSON.stringify({
    //       recipient_msisdn: phoneNumber,
    //       network_id: networkId,
    //       shared_bundle: Number(bundleName),
    //       incoming_api_ref: reference
    //     })
    //   }
    // );

    // const Orderres = await placeOrder.json().catch(() => {});
    // console.log('Raw response:', Orderres);

    // if (!placeOrder.ok) {

    //   return NextResponse.json({ error: ' could not place an order' }, { status: 500 });

    // }



    // console.log(' purchase order response:', Orderres)

    const transaction_id = `TXT - ${Date.now()}`
     await Order.findByIdAndUpdate(order._id, { transaction_id });    

   

    console.log('📦 New order created:', order);
    return NextResponse.json({ message: "Order created successfully", order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ message: "Error creating order" }, { status: 500 });
  }
}
