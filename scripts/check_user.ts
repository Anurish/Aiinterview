
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: "85anurish@gmail.com" },
    });

    if (user) {
        console.log("User found:", user);
    } else {
        console.log("User not found (DELETED)");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
