const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

exports.handler = async function (event) {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    

    const { first_name, last_name, email, subject, message, captcha } = body;

    // Basic validation
    if (!first_name || !last_name || !email || !subject || !message) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "All fields are required." }),
        };
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,       // set in Netlify env vars
            pass: process.env.GMAIL_APP_PASS,   // Gmail App Password
        },
    });

    const mailOptions = {
        from: `"${first_name} ${last_name}" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,             // sends to yourself
        replyTo: email,                         // reply goes to the sender
        subject: `[Contact Form] ${subject}`,
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #007e76, #00b4a6); padding: 36px 32px;">
            <p style="margin: 0 0 4px 0; font-size: 0.85rem; color: rgba(255,255,255,0.75); letter-spacing: 2px; text-transform: uppercase;">You have a new message</p>
            <h1 style="margin: 0; font-size: 1.8rem; color: #ffffff; font-weight: 700;">Contact Form Submission</h1>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">

            <!-- Sender Info Card -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 0.75rem; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;">Sender Details</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem; width: 80px;">Name</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 0.875rem; font-weight: 600;">${first_name} ${last_name}</td>
                    </tr>
                    <tr style="border-top: 1px solid #e2e8f0;">
                        <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem;">Email</td>
                        <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #007e76; font-size: 0.875rem; font-weight: 600; text-decoration: none;">${email}</a></td>
                    </tr>
                    <tr style="border-top: 1px solid #e2e8f0;">
                        <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem;">Subject</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 0.875rem; font-weight: 600;">${subject}</td>
                    </tr>
                </table>
            </div>

            <!-- Message -->
            <p style="margin: 0 0 10px 0; font-size: 0.75rem; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;">Message</p>
            <div style="background: #f8fafc; border-left: 4px solid #007e76; border-radius: 0 12px 12px 0; padding: 20px 24px; color: #374151; font-size: 0.95rem; line-height: 1.7;">
                ${message.replace(/\n/g, "<br>")}
            </div>

            <!-- Reply Button -->
            <div style="text-align: center; margin-top: 32px;">
                <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #007e76, #00b4a6); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 0.95rem; font-weight: 600; letter-spacing: 0.5px;">
                    Reply to ${first_name}
                </a>
            </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 0.78rem; color: #94a3b8;">This message was sent via your website contact form.</p>
        </div>

    </div>
`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: "Email sent successfully!" }),
        };
    } catch (error) {
        console.error("Nodemailer error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to send email. Please try again." }),
        };
    }
};