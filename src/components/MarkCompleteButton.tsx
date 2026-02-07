"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface MarkCompleteButtonProps {
    sessionId: string;
    status: string;
}

export function MarkCompleteButton({ sessionId, status }: MarkCompleteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    if (status === "COMPLETED") {
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                COMPLETED
            </span>
        );
    }

    const handleMarkComplete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);
        try {
            const response = await fetch("/api/interview/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
            });

            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to mark complete:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleMarkComplete}
            disabled={isLoading}
            className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 hover:bg-green-500/20 hover:text-green-400 transition-colors flex items-center gap-1"
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Marking...
                </>
            ) : (
                <>
                    <CheckCircle className="h-3 w-3" />
                    Mark Complete
                </>
            )}
        </button>
    );
}
