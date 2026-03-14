import { NextRequest , NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req:NextRequest){

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        await dbConnect();

        const {email , reference} = await req.json();

        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

            const price = 30* 0.02 + 30;
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const paystackData = await verifyResponse.json()

    //  console.log('Payment verification response:', paystackData)
    if (!paystackData.data) {
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
    }

    const { amount} = paystackData.data
    if (amount / 100 !== price) {
      return NextResponse.json({ message: "Payment amount does not match" }, { status: 400 });
    }

        const user = await User.findOne({email});
        if(!user){
            return NextResponse.json({message:"Unauthorized access"} , {status:400})
        }

        if(user.role == "admin"){
            return NextResponse.json({message:"You are an Admin no need to register"} , {status:400})
        }

        if(user.role == "agent"){
            return NextResponse.json({message:"You are already an Agent"} , {status:400})
        }
         
        user.role = "agent";
        await user.save();
        session.user.role = "agent";
        console.log("User role updated to agent", session.user.role)
   

        
    } catch (error) {

        console.log(error)
    }

    return NextResponse.json({message:"Agent registered successfully"} , {status:200})
}