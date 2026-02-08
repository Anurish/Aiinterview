
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: "85anurish@gmail.com" },
            include: {
                subscription: true
            }
        });

        if (user) {
            console.log("User Data:", JSON.stringify(user, null, 2));
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
