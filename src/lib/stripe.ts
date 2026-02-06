import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    // apiVersion: "2024-06-20", // Use default or specific version if needed
    typescript: true,
});

// Pricing configuration
export const PLANS = {
    FREE: {
        name: "Free",
        price: 0,
        mocksPerMonth: 3,
        features: [
            "3 mock interviews per month",
            "Beginner level questions only",
            "Text-based feedback",
            "Basic performance scores",
        ],
    },
    PRO: {
        name: "Pro",
        priceINR: 599,
        priceUSD: 10,
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "",
        features: [
            "Unlimited mock interviews",
            "All difficulty levels",
            "AI-powered detailed reports",
            "All role tracks (Frontend, Backend, DSA, etc.)",
            "Progress dashboard & analytics",
            "Performance tracking over time",
            "Detailed feedback on each answer",
            "Priority support",
        ],
    },
} as const;

export const CREDIT_PACKS = {
    PACK_1: {
        credits: 1,
        priceINR: 99,
        priceUSD: 2,
        stripePriceId: process.env.STRIPE_CREDIT_1_PRICE_ID || "",
    },
    PACK_3: {
        credits: 3,
        priceINR: 249,
        priceUSD: 4,
        stripePriceId: process.env.STRIPE_CREDIT_3_PRICE_ID || "",
    },
    PACK_7: {
        credits: 7,
        priceINR: 499,
        priceUSD: 8,
        stripePriceId: process.env.STRIPE_CREDIT_7_PRICE_ID || "",
    },
} as const;

export async function createCheckoutSession(
    userId: string,
    priceId: string,
    mode: "subscription" | "payment",
    successUrl: string,
    cancelUrl: string
): Promise<string> {
    if (!priceId) {
        throw new Error("Price ID is required for checkout session");
    }

    // In demo mode or if API key is not configured, return success URL directly
    const isDemo = process.env.DEMO_MODE === "true";
    const hasValidKey = process.env.STRIPE_SECRET_KEY &&
        !process.env.STRIPE_SECRET_KEY?.includes("placeholder");

    if (isDemo || !hasValidKey) {
        console.log(`📝 DEMO MODE: Simulating Stripe checkout session (${mode})`);
        // Return the success URL to simulate immediate checkout
        return successUrl;
    }

    const session = await stripe.checkout.sessions.create({
        mode,
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            userId,
        },
    });

    if (!session.url) {
        throw new Error("Failed to generate checkout session URL");
    }

    return session.url;
}

export async function createCustomerPortalSession(
    customerId: string,
    returnUrl: string
): Promise<string> {
    // In demo mode or if API key is not configured, return return URL directly
    const isDemo = process.env.DEMO_MODE === "true";
    const hasValidKey = process.env.STRIPE_SECRET_KEY &&
        !process.env.STRIPE_SECRET_KEY?.includes("placeholder");

    if (isDemo || !hasValidKey) {
        console.log("📝 DEMO MODE: Simulating Stripe customer portal");
        return returnUrl;
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    return session.url;
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
    await stripe.subscriptions.cancel(subscriptionId);
}
