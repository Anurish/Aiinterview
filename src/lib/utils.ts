import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getTrackLabel(track: string): string {
    const labels: Record<string, string> = {
        FRONTEND: "Frontend Development",
        NEXTJS: "Next.js",
        MERN: "MERN Stack",
        NODEJS: "Node.js",
        PHP: "PHP",
        LARAVEL: "Laravel",
        DSA: "Data Structures & Algorithms",
        GENERAL_SWE: "General SWE",
    };
    return labels[track] || track;
}

export function getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
        BEGINNER: "text-green-500 bg-green-500/10",
        INTERMEDIATE: "text-yellow-500 bg-yellow-500/10",
        ADVANCED: "text-red-500 bg-red-500/10",
    };
    return colors[difficulty] || "text-gray-500 bg-gray-500/10";
}

export function getScoreColor(score: number): string {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
}
