
import { prisma } from "../src/lib/prisma";

async function main() {
    console.log("Checking Standard Client from lib...");

    if (!prisma.lesson) {
        console.error("❌ prisma.lesson is undefined!");
        process.exit(1);
    }

    const count = await prisma.lesson.count();
    console.log(`✅ Success! Found ${count} lessons.`);
}

main();
