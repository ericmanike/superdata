import { NextResponse } from "next/server";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { to, subject, html, text, from: customFrom } = body;

        // Basic validation
        if (!to || (!html && !text)) {
            return NextResponse.json(
                { error: "Recipient and message content (HTML or Text) are required." },
                { status: 400 }
            );
        }

        const emailFrom = customFrom || `MegaGigs <${RESEND_FROM_EMAIL}>`;

        const { data, error } = await resend.emails.send({
            from: emailFrom,
            to: Array.isArray(to) ? to : [to],
            subject: subject || "No",
            html: html,
            text: text,
        });

        if (error) {
            console.error("Resend API error:", error);
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Email sent successfully",
            data,
        });
    } catch (error: any) {
        console.error("Unexpected error in send-email route:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
