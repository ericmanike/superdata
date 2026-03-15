import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const adminEmail = "manikeeric@gmail.com";

        const result = await resend.emails.send({
            from: 'support@nyamekyeloans.com', // Using the domain from forgot-password
            to: adminEmail,
            subject: `New Support Ticket: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #1e3a8a;">New Support Message</h2>
                    <p><strong>From:</strong> ${name} (${email})</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `,
        });

        return NextResponse.json({ message: 'Ticket sent successfully', id: result.data?.id });
    } catch (error: any) {
        console.error('Support ticket error:', error);
        return NextResponse.json({ error: 'Failed to send ticket' }, { status: 500 });
    }
}
