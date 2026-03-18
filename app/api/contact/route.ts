import { NextResponse } from "next/server";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, message, subject } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const emailSubject = subject ? `${subject} - from ${name}` : `New Contact Form Submission from ${name}`;

        const { data, error } = await resend.emails.send({
            from: `MegaGigs Contact <${RESEND_FROM_EMAIL}>`,
            to: ["manikeeric@gmail.com"],
            subject: emailSubject,
           
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #1a1a1a; margin-top: 0;">New Contact Message</h2>
                    <p style="margin-bottom: 20px; color: #666;">You have received a new message from your website contact form.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                    </div>

                    <div style="padding: 15px; border-left: 4px solid #1a1a1a; background-color: #f4f4f4;">
                        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>

                    <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
                        This email was sent from the MegaGigs contact form.
                    </p>
                </div>
            `,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Resend error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
