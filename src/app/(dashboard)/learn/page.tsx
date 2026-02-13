import { auth } from "@/lib/auth";
import Link from "next/link";
import {
    Code2,
    Terminal,
    Coffee,
    Cpu,
    Database,
    ArrowRight
} from "lucide-react";

const LANGUAGES = [
    {
        id: "javascript",
        name: "JavaScript",
        description: "The language of the web. Perfect for beginners.",
        icon: <Code2 className="h-8 w-8 text-yellow-400" />,
        color: "bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/40"
    },
    {
        id: "python",
        name: "Python",
        description: "Great for AI, data science, and backend development.",
        icon: <Terminal className="h-8 w-8 text-blue-400" />,
        color: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40"
    },
    {
        id: "java",
        name: "Java",
        description: "Enterprise-grade language for large systems.",
        icon: <Coffee className="h-8 w-8 text-orange-400" />,
        color: "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40"
    },
    {
        id: "cpp",
        name: "C++",
        description: "High-performance systems programming.",
        icon: <Cpu className="h-8 w-8 text-blue-600" />,
        color: "bg-blue-600/10 border-blue-600/20 hover:border-blue-600/40"
    },
    {
        id: "go",
        name: "Go",
        description: "Fast, concurrent language by Google.",
        icon: <Database className="h-8 w-8 text-cyan-400" />,
        color: "bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40"
    }
];

export default async function LearnPage() {
    const session = await auth();

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Choose Your Path</h1>
                <p className="text-gray-400">Select a programming language to verify your mastery or learn from scratch.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {LANGUAGES.map((lang) => (
                    <Link
                        key={lang.id}
                        href={`/learn/${lang.id}`}
                        className={`group p-6 rounded-2xl border transition-all hover:scale-[1.02] ${lang.color}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-black/20">
                                {lang.icon}
                            </div>
                            <ArrowRight className="text-white/20 group-hover:text-white transition-colors" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{lang.name}</h3>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            {lang.description}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
