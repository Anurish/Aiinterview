
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
    console.log("Checking Edge Client...");

    // @ts-ignore
    if (!prisma.lesson) {
        console.error("❌ prisma.lesson is undefined on Edge Client!");
        process.exit(1);
    }

    // @ts-ignore
    console.log("✅ prisma.lesson exists on Edge Client.");
}

main();
