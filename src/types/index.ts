// Common types used across the application

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

export type InterviewMode = "TEXT" | "VOICE";

export type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export type QuestionType = "CONCEPTUAL" | "CODING" | "BEHAVIORAL" | "SYSTEM_DESIGN";

export type Plan = "FREE" | "PRO";

export interface User {
    id: string;
    clerkId: string;
    email: string;
    name?: string;
    resumeUrl?: string;
    plan: Plan;
    credits: number;
    mocksThisMonth: number;
}

export interface InterviewSession {
    id: string;
    userId: string;
    track: Track;
    difficulty: Difficulty;
    mode: InterviewMode;
    status: SessionStatus;
    startedAt: Date;
    completedAt?: Date;
    questions?: Question[];
    report?: Report;
}

export interface Question {
    id: string;
    sessionId: string;
    content: string;
    type: QuestionType;
    order: number;
    response?: Response;
}

export interface Response {
    id: string;
    questionId: string;
    answer: string;
    codeSnippet?: string;
    audioUrl?: string;
    accuracy?: number;
    clarity?: number;
    confidence?: number;
    technicalDepth?: number;
    overallScore?: number;
    feedback?: string;
}

export interface Report {
    id: string;
    sessionId: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    roadmap?: RoadmapWeek[];
}

export interface RoadmapWeek {
    week: number;
    focus: string;
    resources: string[];
}

export interface GradingResult {
    accuracy: number;
    clarity: number;
    confidence: number;
    technicalDepth: number;
    overallScore: number;
    feedback: string;
}

// Track options for UI
export const TRACK_OPTIONS: { value: Track; label: string; icon: string }[] = [
    { value: "FRONTEND", label: "Frontend Development", icon: "🎨" },
    { value: "NEXTJS", label: "Next.js", icon: "▲" },
    { value: "MERN", label: "MERN Stack", icon: "🥞" },
    { value: "NODEJS", label: "Node.js", icon: "🟢" },
    { value: "PHP", label: "PHP", icon: "🐘" },
    { value: "LARAVEL", label: "Laravel", icon: "🔺" },
    { value: "DSA", label: "DSA", icon: "🧮" },
    { value: "GENERAL_SWE", label: "General SWE", icon: "💻" },
];

// Difficulty options for UI
export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; description: string }[] = [
    { value: "BEGINNER", label: "Beginner", description: "Fundamental concepts and basic syntax" },
    { value: "INTERMEDIATE", label: "Intermediate", description: "Practical experience required" },
    { value: "ADVANCED", label: "Advanced", description: "Complex architecture and optimization" },
];
