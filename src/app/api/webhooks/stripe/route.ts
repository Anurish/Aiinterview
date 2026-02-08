import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Disable body parsing, we need the raw body for signature verification
// Note: App Router API routes consume body as stream/text by default via request.text()

export async function POST(request: NextRequest) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
        console.error("⚠️ Stripe Webhook: No signature provided");
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("⚠️ Stripe Webhook: Signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`🔔 Stripe Webhook received: ${event.type}`);

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;

                console.log(`Processing checkout.session.completed for user: ${userId}`);

                if (!userId) {
                    console.error("⚠️ Stripe Webhook: userId missing in metadata");
                    break;
                }

                if (session.mode === "subscription") {
                    // Pro subscription
                    if (!session.subscription) {
                        console.error("⚠️ Stripe Webhook: Subscription ID missing in checkout session");
                        break;
                    }

                    const subscriptionId = typeof session.subscription === "string"
                        ? session.subscription
                        : session.subscription.id;

                    console.log(`Fetching subscription: ${subscriptionId}`);
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                    if (!session.customer) {
                        console.error("⚠️ Stripe Webhook: Customer ID missing in checkout session");
                        break;
                    }

                    const customerId = typeof session.customer === "string"
                        ? session.customer
                        : (session.customer as any).id;

                    const priceId = subscription.items.data[0]?.price.id;
                    if (!priceId) {
                        console.error("⚠️ Stripe Webhook: Price ID missing in subscription");
                        break;
                    }

                    console.log(`Upserting subscription for user ${userId} / cust ${customerId}`);

                    try {
                        await prisma.subscription.upsert({
                            where: { userId },
                            update: {
                                stripeCustomerId: customerId,
                                stripeSubscriptionId: subscription.id,
                                stripePriceId: priceId,
                                status: subscription.status,
                                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                            },
                            create: {
                                userId,
                                stripeCustomerId: customerId,
                                stripeSubscriptionId: subscription.id,
                                stripePriceId: priceId,
                                status: subscription.status,
                                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                            },
                        });

                        await prisma.user.update({
                            where: { id: userId },
                            data: { plan: "PRO" },
                        });
                        console.log(`✅ User ${userId} upgraded to PRO`);
                    } catch (dbError) {
                        console.error("❌ Stripe Webhook: DB Error upgrading user:", dbError);
                    }

                } else if (session.mode === "payment") {
                    // Credit purchase
                    const credits = parseInt(session.metadata?.credits || "0");
                    console.log(`Adding ${credits} credits to user ${userId}`);

                    try {
                        await prisma.user.update({
                            where: { id: userId },
                            data: { credits: { increment: credits } },
                        });
                        console.log(`✅ Credits added to user ${userId}`);
                    } catch (dbError) {
                        console.error("❌ Stripe Webhook: DB Error adding credits:", dbError);
                    }
                }
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;
                console.log(`Processing invoice.payment_succeeded: ${invoice.id}`);

                // ... (rest of invoice logic)
                const subscriptionId = typeof (invoice as any).subscription === "string"
                    ? (invoice as any).subscription
                    : (invoice as any).subscription?.id;

                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                    await prisma.subscription.update({
                        where: { stripeSubscriptionId: subscriptionId },
                        data: {
                            status: subscription.status,
                            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                        },
                    });
                    console.log(`✅ Subscription ${subscriptionId} synced via invoice`);
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                console.log(`Processing customer.subscription.deleted: ${subscription.id}`);

                const dbSubscription = await prisma.subscription.findUnique({
                    where: { stripeSubscriptionId: subscription.id },
                });

                if (dbSubscription) {
                    await prisma.user.update({
                        where: { id: dbSubscription.userId },
                        data: { plan: "FREE" },
                    });

                    await prisma.subscription.delete({
                        where: { stripeSubscriptionId: subscription.id },
                    });
                    console.log(`✅ Subscription ${subscription.id} deleted and user downgraded`);
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                console.log(`Processing customer.subscription.updated: ${subscription.id}`);

                await prisma.subscription.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        status: subscription.status,
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                    },
                });
                console.log(`✅ Subscription ${subscription.id} status updated`);
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("❌ Stripe Webhook: Processing error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
