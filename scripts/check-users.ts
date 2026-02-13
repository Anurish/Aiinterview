
import { prisma } from "../src/lib/prisma";

async function main() {
    console.log("Checking Users...");
    const users = await prisma.user.findMany({
        select: {
            email: true,
            plan: true,
            id: true,
        }
    });

    console.table(users);
}

main();
