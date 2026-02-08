"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCustomerPortalSession } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createStripePortalSession() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId) {
        throw new Error("No subscription found");
    }

    const portalUrl = await createCustomerPortalSession(
        subscription.stripeCustomerId,
        `${process.env.NEXT_PUBLIC_APP_URL}/settings`
    );

    redirect(portalUrl);
}
