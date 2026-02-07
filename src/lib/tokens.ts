import { randomBytes } from "crypto";
import { prisma } from "./prisma";

const TOKEN_EXPIRY_HOURS = 24;

export async function generateVerificationToken(email: string): Promise<string> {
    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
        where: { identifier: email },
    });

    // Generate new token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store token
    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    });

    return token;
}

export async function verifyToken(token: string): Promise<string | null> {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
    });

    if (!verificationToken) {
        return null;
    }

    // Check if expired
    if (verificationToken.expires < new Date()) {
        await prisma.verificationToken.delete({
            where: { token },
        });
        return null;
    }

    // Delete the token (one-time use)
    await prisma.verificationToken.delete({
        where: { token },
    });

    return verificationToken.identifier;
}

export async function getVerificationTokenByEmail(email: string) {
    return prisma.verificationToken.findFirst({
        where: { identifier: email },
    });
}
