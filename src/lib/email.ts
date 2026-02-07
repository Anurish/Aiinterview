import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

interface SendVerificationEmailParams {
    email: string;
    token: string;
    name?: string;
}

export async function sendVerificationEmail({
    email,
    token,
    name,
}: SendVerificationEmailParams) {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111827; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="max-width: 500px;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <div style="display: inline-flex; align-items: center; gap: 8px;">
                                <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 10px; border-radius: 12px;">
                                    <span style="font-size: 24px;">✨</span>
                                </div>
                                <span style="color: #ffffff; font-size: 24px; font-weight: bold;">InterviewAI</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Card -->
                    <tr>
                        <td style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px;">
                            <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; text-align: center;">
                                Verify Your Email
                            </h1>
                            <p style="color: #9ca3af; font-size: 16px; line-height: 24px; margin: 0 0 24px 0; text-align: center;">
                                Hi${name ? ` ${name}` : ""}! Thanks for signing up. Click the button below to verify your email and get started.
                            </p>
                            
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0; text-align: center;">
                                This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding-top: 30px; text-align: center;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                © ${new Date().getFullYear()} InterviewAI. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    await transporter.sendMail({
        from: `"InterviewAI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your email - InterviewAI",
        html,
    });
}
