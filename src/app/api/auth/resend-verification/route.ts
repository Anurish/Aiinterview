import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists or not
            return NextResponse.json({
                message: "If an account exists, a verification email has been sent.",
            });
        }

        if (user.emailVerified) {
            return NextResponse.json({
                message: "Email is already verified. You can sign in.",
                alreadyVerified: true,
            });
        }

        // Generate and send new verification email
        const token = await generateVerificationToken(email);
        await sendVerificationEmail({ email, token, name: user.name || undefined });

        return NextResponse.json({
            message: "Verification email sent. Please check your inbox.",
        });
    } catch (error) {
        console.error("Resend verification error:", error);
        return NextResponse.json(
            { error: "Failed to send verification email" },
            { status: 500 }
        );
    }
}
