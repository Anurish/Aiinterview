import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use edge-compatible auth config (no Prisma)
export default NextAuth(authConfig).auth;

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)", "/api/:path*"],
};
