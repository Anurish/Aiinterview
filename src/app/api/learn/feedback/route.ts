
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateText } from "@/lib/ai";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { lessonTitle, description, userCode, testResults, output } = await req.json();

        const prompt = `
You are a helpful and encouraging coding tutor. A student is working on a lesson titled "${lessonTitle}".
Lesson Description:
${description.substring(0, 500)}...

The student's code:
\`\`\`javascript
${userCode}
\`\`\`

The code execution output:
${output ? output.join("\n") : "No output"}

The failing tests:
${testResults.map((t: any) => `- ${t.message}`).join("\n")}

Please provide a short, specific hint to help the student fix their code. 
Do not give the full solution code. 
Focus on what went wrong based on the failing tests and output.
Keep the tone positive and encouraging.
Limit your response to 2-3 sentences.
        `;

        const feedback = await generateText(prompt);

        return NextResponse.json({ feedback });
    } catch (error) {
        console.error("[AI_FEEDBACK]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
