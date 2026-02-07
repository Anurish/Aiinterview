import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/tokens";

export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(
                new URL("/sign-in?error=missing-token", request.url)
            );
        }

        // Verify the token
        const email = await verifyToken(token);

        if (!email) {
            return NextResponse.redirect(
                new URL("/sign-in?error=invalid-token", request.url)
            );
        }

        // Update user's emailVerified timestamp
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        });

        // Redirect to success page
        return NextResponse.redirect(
            new URL("/email-verified", request.url)
        );
    } catch (error) {
        console.error("Email verification error:", error);
        return NextResponse.redirect(
            new URL("/sign-in?error=verification-failed", request.url)
        );
    }
}
