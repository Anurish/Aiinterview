import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

// Full auth config with Prisma - only used in Node.js runtime (API routes)
export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    return null;
                }

                // Check if email is verified
                if (!user.emailVerified) {
                    throw new Error("EmailNotVerified");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    plan: user.plan,
                };
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger, session }) {
            // Run existing jwt callback first
            if (authConfig.callbacks?.jwt) {
                token = await authConfig.callbacks.jwt({ token, user, trigger, session } as any) || token;
            }

            // If plan is missing in token, fetch from DB
            if (!token.plan && token.sub) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: { plan: true },
                });
                if (dbUser) {
                    token.plan = dbUser.plan;
                }
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            // Run existing session callback
            if (authConfig.callbacks?.session) {
                session = await authConfig.callbacks.session({ session, token } as any) || session;
            }
            // Ensure plan is on session user
            if (token.plan && session.user) {
                session.user.plan = token.plan as string;
            }
            return session;
        }
    }
});

// Helper function to get the current user (server-side)
export async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            plan: true,
            credits: true,
            mocksThisMonth: true,
            lastMockReset: true,
        },
    });

    return user;
}
