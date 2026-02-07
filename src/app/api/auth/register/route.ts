import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // If user exists but not verified, allow resending verification
            if (!existingUser.emailVerified) {
                const token = await generateVerificationToken(email);
                await sendVerificationEmail({ email, token, name: existingUser.name || undefined });
                return NextResponse.json({
                    message: "Verification email resent. Please check your inbox.",
                    requiresVerification: true,
                });
            }
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user (without emailVerified)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                // emailVerified is null by default - user must verify
            },
        });

        // Generate and send verification email
        const token = await generateVerificationToken(email);
        await sendVerificationEmail({ email, token, name });

        return NextResponse.json({
            message: "Account created! Please check your email to verify your account.",
            requiresVerification: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Failed to create account" },
            { status: 500 }
        );
    }
}
