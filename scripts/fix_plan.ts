
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Update User Plan
        const user = await prisma.user.update({
            where: { email: "85anurish@gmail.com" },
            data: {
                plan: "PRO",
                credits: 50, // Give some credits
            }
        });

        console.log("Updated User:", user);

        // 2. Create Dummy Subscription (if needed for logic)
        // Check if subscription exists first to avoid unique constraint error
        const existingSub = await prisma.subscription.findUnique({
            where: { userId: user.id }
        });

        if (!existingSub) {
            const sub = await prisma.subscription.create({
                data: {
                    userId: user.id,
                    stripeCustomerId: "cus_manual_override_" + Date.now(),
                    stripeSubscriptionId: "sub_manual_override_" + Date.now(),
                    stripePriceId: "price_manual_override",
                    status: "active",
                    currentPeriodEnd: new Date("2027-01-01"), // Long expiry
                }
            });
            console.log("Created Subscription:", sub);
        } else {
            console.log("Subscription already exists, updating status...");
            const updatedSub = await prisma.subscription.update({
                where: { id: existingSub.id },
                data: { status: 'active' }
            });
            console.log("Updated Subscription:", updatedSub);
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
