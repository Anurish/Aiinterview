import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const demoMode = process.env.DEMO_MODE === "true";

// Only require API key if not in demo mode
if (!apiKey && !demoMode) {
    throw new Error(
        "OPENAI_API_KEY environment variable is not set. Please configure it or set DEMO_MODE=true for testing."
    );
}

export const openai = new OpenAI({
    apiKey: apiKey || "sk-demo-key",
});

export type Track =
    | "FRONTEND"
    | "NEXTJS"
    | "MERN"
    | "NODEJS"
    | "PHP"
    | "LARAVEL"
    | "DSA"
    | "GENERAL_SWE";

export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

const trackDescriptions: Record<Track, string> = {
    FRONTEND: "Frontend development with HTML, CSS, JavaScript, React, Vue, Angular",
    NEXTJS: "Next.js framework, SSR, SSG, App Router, API routes, middleware",
    MERN: "MongoDB, Express.js, React.js, Node.js full-stack development",
    NODEJS: "Node.js backend development, Express, APIs, async programming",
    PHP: "PHP programming, OOP, MySQL, web development",
    LARAVEL: "Laravel framework, Eloquent ORM, Blade templates, middleware",
    DSA: "Data Structures and Algorithms, problem-solving, coding challenges",
    GENERAL_SWE: "General software engineering principles, system design, best practices",
};

const difficultyDescriptions: Record<Difficulty, string> = {
    BEGINNER: "Entry-level questions testing fundamental concepts and basic syntax",
    INTERMEDIATE: "Questions requiring practical experience and problem-solving skills",
    ADVANCED: "Complex questions on architecture, optimization, and advanced patterns",
};

// Demo mode data for testing without API calls
const demoQuestions: Record<Track, Record<Difficulty, { content: string; type: "CONCEPTUAL" | "CODING" | "BEHAVIORAL" | "SYSTEM_DESIGN" }[]>> = {
    FRONTEND: {
        BEGINNER: [
            { content: "Explain the difference between HTML, CSS, and JavaScript", type: "CONCEPTUAL" },
            { content: "What is the box model in CSS?", type: "CONCEPTUAL" },
            { content: "How do you select an element with ID 'main' in CSS?", type: "CODING" },
            { content: "What is event delegation?", type: "CONCEPTUAL" },
            { content: "Describe a challenging frontend project you've worked on", type: "BEHAVIORAL" },
        ],
        INTERMEDIATE: [
            { content: "Explain React hooks and when you would use them", type: "CONCEPTUAL" },
            { content: "What is the Virtual DOM and how does it improve performance?", type: "CONCEPTUAL" },
            { content: "Build a custom React hook for managing form state", type: "CODING" },
            { content: "How do you optimize CSS for performance?", type: "CONCEPTUAL" },
            { content: "Tell us about a time you debugged a complex CSS issue", type: "BEHAVIORAL" },
        ],
        ADVANCED: [
            { content: "Design a state management solution for a large-scale React application", type: "SYSTEM_DESIGN" },
            { content: "Explain the event loop and microtask queue in JavaScript", type: "CONCEPTUAL" },
            { content: "Implement a virtual scrolling component for rendering large lists", type: "CODING" },
            { content: "How would you architect a component library for multiple teams?", type: "SYSTEM_DESIGN" },
            { content: "Describe your approach to performance optimization in web applications", type: "BEHAVIORAL" },
        ],
    },
    NEXTJS: {
        BEGINNER: [
            { content: "What is Next.js and how does it differ from React?", type: "CONCEPTUAL" },
            { content: "Explain the difference between static and dynamic routes in Next.js", type: "CONCEPTUAL" },
            { content: "How do you create an API route in Next.js?", type: "CODING" },
            { content: "What is SSR and why is it useful?", type: "CONCEPTUAL" },
            { content: "Share your experience with Next.js projects", type: "BEHAVIORAL" },
        ],
        INTERMEDIATE: [
            { content: "How does Next.js handle image optimization?", type: "CONCEPTUAL" },
            { content: "Explain incremental static regeneration (ISR)", type: "CONCEPTUAL" },
            { content: "Build a middleware that logs all API requests", type: "CODING" },
            { content: "What are the benefits of App Router over Pages Router?", type: "CONCEPTUAL" },
            { content: "Describe a full-stack feature you built with Next.js", type: "BEHAVIORAL" },
        ],
        ADVANCED: [
            { content: "Design a caching strategy for a Next.js application with database interactions", type: "SYSTEM_DESIGN" },
            { content: "How would you handle authentication and authorization in Next.js?", type: "SYSTEM_DESIGN" },
            { content: "Implement server actions for form handling with validation", type: "CODING" },
            { content: "Explain the differences between server and client components", type: "CONCEPTUAL" },
            { content: "How do you scale a Next.js application for millions of users?", type: "SYSTEM_DESIGN" },
        ],
    },
    DSA: {
        BEGINNER: [
            { content: "Implement a function to reverse an array", type: "CODING" },
            { content: "Explain the difference between arrays and linked lists", type: "CONCEPTUAL" },
            { content: "Write a function to find the sum of all elements in an array", type: "CODING" },
            { content: "What is Big O notation?", type: "CONCEPTUAL" },
            { content: "Describe your learning path in data structures", type: "BEHAVIORAL" },
        ],
        INTERMEDIATE: [
            { content: "Implement a binary search algorithm", type: "CODING" },
            { content: "What is the difference between a stack and a queue?", type: "CONCEPTUAL" },
            { content: "Solve the 'Two Sum' problem using a hash map", type: "CODING" },
            { content: "Explain depth-first search and breadth-first search", type: "CONCEPTUAL" },
            { content: "Tell us about a challenging algorithm problem you solved", type: "BEHAVIORAL" },
        ],
        ADVANCED: [
            { content: "Implement Dijkstra's shortest path algorithm", type: "CODING" },
            { content: "Design a data structure that supports O(1) insert, delete, and getRandom operations", type: "SYSTEM_DESIGN" },
            { content: "Explain dynamic programming with the longest common subsequence problem", type: "CODING" },
            { content: "How do you choose between different sorting algorithms?", type: "CONCEPTUAL" },
            { content: "Design a solution for finding the median of a data stream", type: "SYSTEM_DESIGN" },
        ],
    },
    NODEJS: {
        BEGINNER: [
            { content: "What is Node.js and how is it different from browser JavaScript?", type: "CONCEPTUAL" },
            { content: "Explain the event-driven architecture of Node.js", type: "CONCEPTUAL" },
            { content: "Create a simple HTTP server using Node.js", type: "CODING" },
            { content: "What is npm and what does it do?", type: "CONCEPTUAL" },
            { content: "Share your experience with Node.js projects", type: "BEHAVIORAL" },
        ],
        INTERMEDIATE: [
            { content: "Explain middleware in Express.js", type: "CONCEPTUAL" },
            { content: "How do you handle errors in async/await?", type: "CODING" },
            { content: "What is the difference between blocking and non-blocking operations?", type: "CONCEPTUAL" },
            { content: "Build a REST API endpoint with error handling", type: "CODING" },
            { content: "Describe a backend service you built with Node.js", type: "BEHAVIORAL" },
        ],
        ADVANCED: [
            { content: "Design a scalable microservices architecture using Node.js", type: "SYSTEM_DESIGN" },
            { content: "How would you implement caching and rate limiting?", type: "SYSTEM_DESIGN" },
            { content: "Implement a worker pool for handling CPU-intensive tasks", type: "CODING" },
            { content: "Explain the event loop and how it handles concurrency", type: "CONCEPTUAL" },
            { content: "How do you monitor and optimize performance in production Node.js applications?", type: "BEHAVIORAL" },
        ],
    },
    MERN: {
        BEGINNER: [
            { content: "What does MERN stack stand for?", type: "CONCEPTUAL" },
            { content: "How do you connect a React frontend to a Node.js backend?", type: "CONCEPTUAL" },
            { content: "Create a simple MongoDB schema for a blog post", type: "CODING" },
            { content: "What is Express.js used for?", type: "CONCEPTUAL" },
            { content: "Tell us about your first MERN project", type: "BEHAVIORAL" },
        ],
        INTERMEDIATE: [
            { content: "Explain how to handle authentication in a MERN app", type: "CONCEPTUAL" },
            { content: "Build a POST endpoint that saves data to MongoDB", type: "CODING" },
            { content: "How do you manage state across a MERN application?", type: "CONCEPTUAL" },
            { content: "Implement error handling and validation in a REST API", type: "CODING" },
            { content: "Describe a full-stack feature you've implemented", type: "BEHAVIORAL" },
        ],
        ADVANCED: [
            { content: "Design a real-time notification system for a MERN app", type: "SYSTEM_DESIGN" },
            { content: "How would you implement role-based access control?", type: "SYSTEM_DESIGN" },
            { content: "Optimize a MongoDB query with indexing and aggregation pipeline", type: "CODING" },
            { content: "Explain transaction handling and data consistency", type: "CONCEPTUAL" },
            { content: "How do you deploy and scale a MERN application?", type: "SYSTEM_DESIGN" },
        ],
    },
    PHP: {
        BEGINNER: [
            { content: "What is PHP and what is it used for?", type: "CONCEPTUAL" },
            { content: "Explain the difference between == and === in PHP", type: "CONCEPTUAL" },
            { content: "Write a PHP function to validate an email address", type: "CODING" },
            { content: "What are PHP superglobals?", type: "CONCEPTUAL" },
            { content: "Share your experience with PHP development", type: "BEHAVIORAL" },
        ],
        INTERMEDIATE: [
            { content: "Explain object-oriented programming in PHP", type: "CONCEPTUAL" },
            { content: "How do you handle database connections securely in PHP?", type: "CONCEPTUAL" },
            { content: "Build a simple PHP class for database operations", type: "CODING" },
            { content: "What is SQL injection and how do you prevent it?", type: "CONCEPTUAL" },
            { content: "Describe a web application you built with PHP", type: "BEHAVIORAL" },
        ],
        ADVANCED: [
            { content: "Design a PHP framework for building REST APIs", type: "SYSTEM_DESIGN" },
            { content: "Explain dependency injection and how to implement it", type: "CONCEPTUAL" },
            { content: "Implement caching and query optimization for a PHP application", type: "CODING" },
            { content: "How do you handle security vulnerabilities in PHP?", type: "CONCEPTUAL" },
            { content: "What are best practices for scaling PHP applications?", type: "BEHAVIORAL" },
        ],
    },
    LARAVEL: {
        BEGINNER: [
            { content: "What is Laravel and what is its main purpose?", type: "CONCEPTUAL" },
            { content: "Explain the MVC architecture in Laravel", type: "CONCEPTUAL" },
            { content: "How do you create a migration in Laravel?", type: "CODING" },
            { content: "What is the Eloquent ORM?", type: "CONCEPTUAL" },
            { content: "Tell us about your Laravel projects", type: "BEHAVIORAL" },
        ],
        INTERMEDIATE: [
            { content: "How do you handle authentication in Laravel?", type: "CONCEPTUAL" },
            { content: "Explain middleware and how it works in Laravel", type: "CONCEPTUAL" },
            { content: "Build a Laravel route with a controller method", type: "CODING" },
            { content: "What are Blade templates?", type: "CONCEPTUAL" },
            { content: "Describe a feature you built using Eloquent relationships", type: "BEHAVIORAL" },
        ],
        ADVANCED: [
            { content: "Design a package for Laravel with reusable functionality", type: "SYSTEM_DESIGN" },
            { content: "How would you optimize database queries in a large Laravel app?", type: "SYSTEM_DESIGN" },
            { content: "Implement advanced Eloquent patterns and query optimization", type: "CODING" },
            { content: "Explain event-driven architecture in Laravel", type: "CONCEPTUAL" },
            { content: "How do you test Laravel applications effectively?", type: "BEHAVIORAL" },
        ],
    },
    GENERAL_SWE: {
        BEGINNER: [
            { content: "What is version control and why is Git important?", type: "CONCEPTUAL" },
            { content: "Explain the difference between a bug and a feature request", type: "CONCEPTUAL" },
            { content: "Write pseudocode for a simple sorting algorithm", type: "CODING" },
            { content: "What is the purpose of code reviews?", type: "CONCEPTUAL" },
            { content: "Tell us about your journey into software engineering", type: "BEHAVIORAL" },
        ],
        INTERMEDIATE: [
            { content: "Explain SOLID principles in software design", type: "CONCEPTUAL" },
            { content: "What is a design pattern and can you give examples?", type: "CONCEPTUAL" },
            { content: "Design a simple system for managing user permissions", type: "SYSTEM_DESIGN" },
            { content: "How do you approach debugging complex issues?", type: "BEHAVIORAL" },
            { content: "Explain the difference between testing strategies", type: "CONCEPTUAL" },
        ],
        ADVANCED: [
            { content: "Design a scalable system architecture for a social media platform", type: "SYSTEM_DESIGN" },
            { content: "How do you handle technical debt in a codebase?", type: "BEHAVIORAL" },
            { content: "Explain trade-offs between consistency, availability, and partition tolerance", type: "CONCEPTUAL" },
            { content: "How would you approach optimizing a slow database query?", type: "SYSTEM_DESIGN" },
            { content: "Describe your philosophy on writing maintainable code", type: "BEHAVIORAL" },
        ],
    },
};

export async function generateInterviewQuestions(
    track: Track,
    difficulty: Difficulty,
    questionCount: number = 5,
    resumeContext?: string
): Promise<{ content: string; type: "CONCEPTUAL" | "CODING" | "BEHAVIORAL" | "SYSTEM_DESIGN" }[]> {
    // Demo mode: return realistic sample questions
    if (demoMode) {
        console.log("📝 DEMO MODE: Using sample interview questions");
        const questions = demoQuestions[track][difficulty] || [];
        return questions.slice(0, questionCount);
    }

    const systemPrompt = `You are an expert technical interviewer specializing in ${trackDescriptions[track]}.
Generate ${questionCount} interview questions at ${difficulty} level (${difficultyDescriptions[difficulty]}).

${resumeContext ? `The candidate's resume context: ${resumeContext}\nTailor some questions to their experience.` : ""}

For DSA track, include coding problems. For other tracks, mix conceptual, behavioral, and practical questions.

Return a JSON array with objects containing:
- content: The question text
- type: One of "CONCEPTUAL", "CODING", "BEHAVIORAL", "SYSTEM_DESIGN"

Only return valid JSON, no markdown formatting.`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate ${questionCount} ${difficulty} level ${track} interview questions.` },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const parsed = JSON.parse(content);
    return parsed.questions || [];
}

export async function evaluateResponse(
    question: string,
    answer: string,
    track: Track,
    difficulty: Difficulty,
    codeSnippet?: string
): Promise<{
    accuracy: number;
    clarity: number;
    confidence: number;
    technicalDepth: number;
    overallScore: number;
    feedback: string;
}> {
    // Demo mode: return realistic evaluation
    if (demoMode) {
        console.log("📝 DEMO MODE: Using sample evaluation");
        const baseScores = {
            BEGINNER: { accuracy: 78, clarity: 75, confidence: 70, technicalDepth: 65 },
            INTERMEDIATE: { accuracy: 82, clarity: 80, confidence: 78, technicalDepth: 75 },
            ADVANCED: { accuracy: 85, clarity: 82, confidence: 80, technicalDepth: 78 },
        };
        const scores = baseScores[difficulty];
        // Add some variance based on answer length
        const variance = Math.min(answer.length / 50, 10);
        return {
            accuracy: Math.min(100, scores.accuracy + variance),
            clarity: Math.min(100, scores.clarity + variance),
            confidence: Math.min(100, scores.confidence + variance),
            technicalDepth: Math.min(100, scores.technicalDepth + variance),
            overallScore: Math.min(100, (scores.accuracy * 0.35 + scores.clarity * 0.25 + scores.confidence * 0.15 + scores.technicalDepth * 0.25) + variance),
            feedback: `Great response! You demonstrated good understanding of ${question.split(" ").slice(0, 3).join(" ")}. Your explanation was clear and well-structured. Keep practicing similar problems to deepen your expertise.`,
        };
    }

    const systemPrompt = `You are an expert technical interview evaluator for ${trackDescriptions[track]}.
Evaluate the candidate's response at ${difficulty} level.

Score each dimension from 0-100:
- accuracy: Correctness and completeness of the answer
- clarity: How well the answer is explained and structured
- confidence: Word choice and assertiveness (inferred from text)
- technicalDepth: Use of advanced concepts and best practices

Provide constructive feedback highlighting strengths and areas for improvement.

Return JSON with: accuracy, clarity, confidence, technicalDepth, overallScore, feedback
The overallScore should be weighted: (accuracy * 0.35) + (clarity * 0.25) + (confidence * 0.15) + (technicalDepth * 0.25)`;

    const userMessage = `Question: ${question}

Answer: ${answer}
${codeSnippet ? `\nCode Snippet:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ""}

Evaluate this response.`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
}

export async function* streamEvaluateResponse(
    question: string,
    answer: string,
    track: Track,
    difficulty: Difficulty,
    codeSnippet?: string
): AsyncGenerator<string> {
    // Demo mode: stream sample feedback
    if (demoMode) {
        console.log("📝 DEMO MODE: Streaming sample evaluation");
        const demoFeedback = `
Overall Assessment:
Your response demonstrates a solid understanding of the core concepts. You provided a clear explanation with good structure and logical flow.

Strengths:
✓ Clear communication of ideas
✓ Logical approach to the problem
✓ Good use of examples

Areas for Improvement:
- Could add more technical depth
- Consider edge cases in your solution
- Practice explaining complex concepts more concisely

Score Breakdown:
- Accuracy: 82/100
- Clarity: 80/100
- Confidence: 78/100
- Technical Depth: 75/100

Overall Score: 79/100 - Great job! Keep practicing similar problems to improve further.
        `.trim();

        for (const char of demoFeedback) {
            yield char;
            // Simulate streaming delay
            await new Promise(resolve => setTimeout(resolve, 5));
        }
        return;
    }

    const systemPrompt = `You are an expert technical interview evaluator for ${trackDescriptions[track]}.
Evaluate the candidate's response at ${difficulty} level. Provide detailed, constructive feedback.

Structure your response:
1. Overall Assessment (brief summary)
2. Strengths (what they did well)
3. Areas for Improvement (specific suggestions)
4. Score Breakdown: accuracy, clarity, confidence, technicalDepth (0-100 each)
5. Overall Score (weighted average)`;

    const userMessage = `Question: ${question}

Answer: ${answer}
${codeSnippet ? `\nCode Snippet:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ""}

Provide a detailed evaluation.`;

    const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        temperature: 0.5,
        stream: true,
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
            yield content;
        }
    }
}

export async function generateReport(
    sessionData: {
        track: Track;
        difficulty: Difficulty;
        questions: { content: string; response?: { answer: string; overallScore?: number; feedback?: string } }[];
    }
): Promise<{
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    roadmap: { week: number; focus: string; resources: string[] }[];
}> {
    // Demo mode: return sample report
    if (demoMode) {
        console.log("📝 DEMO MODE: Using sample report");
        const avgScore = sessionData.questions.reduce((sum, q) => sum + (q.response?.overallScore || 75), 0) / sessionData.questions.length;
        return {
            overallScore: Math.round(avgScore),
            strengths: [
                "Strong conceptual understanding of core principles",
                "Clear communication and explanation skills",
                "Logical problem-solving approach",
                "Good ability to handle follow-up questions",
            ],
            weaknesses: [
                "Could improve on implementing complex algorithms",
                "Need more practice with edge cases",
                "Some gaps in system design knowledge",
            ],
            recommendations: [
                "Practice implementing medium-level LeetCode problems daily",
                "Study system design patterns and trade-offs",
                "Work on real-world projects to build practical experience",
                "Participate in mock interviews to improve communication",
                "Review SOLID principles and design patterns",
            ],
            roadmap: [
                {
                    week: 1,
                    focus: "Master fundamentals and implement basic algorithms",
                    resources: [
                        "LeetCode Easy problems (20+ problems)",
                        "Review data structures basics",
                    ],
                },
                {
                    week: 2,
                    focus: "Tackle medium-level problems and patterns",
                    resources: [
                        "LeetCode Medium problems (15+ problems)",
                        "Study common interview patterns",
                    ],
                },
                {
                    week: 3,
                    focus: "System design fundamentals",
                    resources: [
                        "System Design Primer",
                        "Design 3-4 simple systems",
                    ],
                },
                {
                    week: 4,
                    focus: "Practice and consolidation",
                    resources: [
                        "Take 2-3 full mock interviews",
                        "Review weak areas",
                    ],
                },
            ],
        };
    }

    const systemPrompt = `You are a career coach analyzing a technical interview performance.
Generate a comprehensive report with:
1. Overall score (0-100)
2. Key strengths demonstrated (3-5 points)
3. Areas needing improvement (3-5 points)
4. Specific recommendations for improvement (3-5 actionable items)
5. A 4-week improvement roadmap with focus areas and resources

Return as JSON with: overallScore, strengths[], weaknesses[], recommendations[], roadmap[]`;

    const sessionSummary = sessionData.questions
        .map((q, i) => `Q${i + 1}: ${q.content}\nScore: ${q.response?.overallScore || "N/A"}\nFeedback: ${q.response?.feedback || "N/A"}`)
        .join("\n\n");

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Track: ${sessionData.track}\nDifficulty: ${sessionData.difficulty}\n\nSession Summary:\n${sessionSummary}` },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
}
