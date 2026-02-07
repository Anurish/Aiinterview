import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, PLANS, CREDIT_PACKS } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { planId } = await request.json();

        // Get user
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const successUrl = `${appUrl}/dashboard?success=true`;
        const cancelUrl = `${appUrl}/pricing?canceled=true`;

        let checkoutUrl: string;

        if (planId === "pro") {
            // Pro subscription
            if (!PLANS.PRO.stripePriceId) {
                return NextResponse.json(
                    { error: "Pro plan is not configured. Please set STRIPE_PRO_PRICE_ID." },
                    { status: 500 }
                );
            }
            checkoutUrl = await createCheckoutSession(
                user.id,
                PLANS.PRO.stripePriceId,
                "subscription",
                successUrl,
                cancelUrl
            );
        } else if (planId.startsWith("credit_")) {
            // Credit pack purchase
            const packKey = `PACK_${planId.split("_")[1]}` as keyof typeof CREDIT_PACKS;
            const pack = CREDIT_PACKS[packKey];

            if (!pack) {
                return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 });
            }

            checkoutUrl = await createCheckoutSession(
                user.id,
                pack.stripePriceId,
                "payment",
                successUrl,
                cancelUrl
            );
        } else {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        // Note: User plan update happens via Stripe webhook after successful payment
        // Do NOT update plan here - wait for webhook confirmation

        return NextResponse.json({ url: checkoutUrl });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
