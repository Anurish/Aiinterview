import { groq } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

const MODEL = "llama-3.3-70b-versatile";

interface LessonPlan {
    title: string;
    slug: string;
    description: string;
    content: string;
    initialCode: string;
    solutionCode: string;
    testCases: Array<{ input: any; expected: any }>;
}

export async function generateCurriculum(language: string): Promise<void> {
    const existingCount = await prisma.lesson.count({
        where: { language }
    });

    if (existingCount >= 5) return;

    console.log(`Generating curriculum for ${language}...`);

    const systemPrompt = `You are an expert programming curriculum designer.
Generate 5 progressive coding lessons for ${language} from Beginner to Intermediate.
The lessons should cover:
1. Basic Syntax & Variables
2. Control Flow (If/Else)
3. Loops
4. Functions
5. Final Challenge

Return a JSON object with a "lessons" array. Each lesson must have:
- title: Short title
- slug: URL-friendly slug (e.g. "python-basics-1")
- description: Brief goal (1-2 sentences)
- content: Full Markdown explanation of the topic + the Problem Statement.
- initialCode: Starter code for the user.
- solutionCode: Working solution.
- testCases: Array of { input, expected } for validation (JSON format).

Ensure the "slug" starts with "${language}-lesson-".
Ensure "initialCode" is valid ${language} syntax.
`;

    const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate 5 ${language} lessons in JSON format.` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    let lessons: LessonPlan[] = [];

    try {
        const parsed = JSON.parse(content);
        lessons = parsed.lessons || [];
    } catch (e) {
        console.error("Failed to parse curriculum JSON", e);
        console.error("Raw content:", content);
        return;
    }

    // Save to DB
    for (const [index, lesson] of lessons.entries()) {
        await prisma.lesson.upsert({
            where: { slug: lesson.slug },
            update: {},
            create: {
                title: lesson.title,
                slug: lesson.slug,
                description: lesson.description,
                content: lesson.content,
                language: language.toLowerCase(),
                order: index + 1,
                initialCode: lesson.initialCode,
                solutionCode: lesson.solutionCode,
                testCases: JSON.stringify(lesson.testCases)
            }
        });
    }

    console.log(`Generated ${lessons.length} lessons for ${language}`);
}
