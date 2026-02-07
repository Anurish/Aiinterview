import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// This config is used by middleware (Edge Runtime)
// It does NOT include Prisma adapter or any database calls
export const authConfig: NextAuthConfig = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/sign-in",
        signOut: "/sign-out",
        error: "/sign-in",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        // Credentials provider placeholder - actual auth happens in auth.ts
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: () => null, // Actual implementation in auth.ts
        }),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAuthPage = nextUrl.pathname.startsWith("/sign-in") ||
                nextUrl.pathname.startsWith("/sign-up");
            const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard") ||
                nextUrl.pathname.startsWith("/interview") ||
                nextUrl.pathname.startsWith("/profile") ||
                nextUrl.pathname.startsWith("/history") ||
                nextUrl.pathname.startsWith("/reports") ||
                nextUrl.pathname.startsWith("/checkout");

            // Redirect logged-in users away from auth pages
            if (isLoggedIn && isAuthPage) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            // Redirect non-logged-in users to sign-in for protected routes
            if (!isLoggedIn && isProtectedRoute) {
                return Response.redirect(new URL("/sign-in", nextUrl));
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
};
