
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Prisma Client for Lesson model...");

    if (!prisma.lesson) {
        console.error("❌ prisma.lesson is undefined!");
        process.exit(1);
    }

    const lessons = await prisma.lesson.findMany();
    console.log(`✅ Success! Found ${lessons.length} lessons.`);
    if (lessons.length > 0) {
        console.log(`First lesson: ${lessons[0].title}`);
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
