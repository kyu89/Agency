const nodemailer = require("nodemailer");

exports.handler = async function (event) {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid JSON body" }),
        };
    }

    const { first_name, last_name, email, subject, message } = body;

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
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #007e76; margin-bottom: 4px;">New Contact Form Submission</h2>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 20px;">
                <p><strong>Name:</strong> ${first_name} ${last_name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f9fafb; padding: 16px; border-radius: 6px; color: #374151;">
                    ${message.replace(/\n/g, "<br>")}
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 20px;">
                <p style="font-size: 0.8rem; color: #9ca3af;">Sent via your website contact form.</p>
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