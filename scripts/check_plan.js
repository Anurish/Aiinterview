
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: "85anurish@gmail.com" },
            select: { id: true, email: true, plan: true, stripeCustomerId: true, stripeSubscriptionId: true }
        });

        if (user) {
            console.log("User found:", user);
        } else {
            console.log("User not found");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
