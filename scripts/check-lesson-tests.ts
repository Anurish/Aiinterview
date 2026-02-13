
import { prisma } from "../src/lib/prisma";

async function main() {
    const lesson = await prisma.lesson.findFirst({
        where: { slug: "js-variables" },
        select: { title: true, testCases: true, initialCode: true }
    });

    if (lesson) {
        console.log("Lesson:", lesson.title);
        console.log("Test Cases:", lesson.testCases);
        console.log("Initial Code:", lesson.initialCode);
    } else {
        console.log("Lesson not found");
    }
}

main();
