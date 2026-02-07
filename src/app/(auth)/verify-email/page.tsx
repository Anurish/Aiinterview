"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, Sparkles, RefreshCw, CheckCircle } from "lucide-react";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleResend = async () => {
        if (!email) return;

        setIsResending(true);
        setError("");
        setResendSuccess(false);

        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to resend email");
                return;
            }

            if (data.alreadyVerified) {
                setError("Your email is already verified. You can sign in.");
            } else {
                setResendSuccess(true);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">InterviewAI</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
                    {/* Email Icon */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center mb-6">
                        <Mail className="h-8 w-8 text-violet-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-3">
                        Check your email
                    </h1>
                    <p className="text-gray-400 mb-6">
                        We&apos;ve sent a verification link to{" "}
                        <span className="text-white font-medium">{email || "your email"}</span>.
                        Click the link to verify your account.
                    </p>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {resendSuccess && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4 flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Verification email sent!
                        </div>
                    )}

                    {/* Resend Button */}
                    <button
                        onClick={handleResend}
                        disabled={isResending || !email}
                        className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-5 w-5" />
                                Resend verification email
                            </>
                        )}
                    </button>

                    {/* Tips */}
                    <div className="text-left bg-white/5 rounded-xl p-4 mb-6">
                        <p className="text-gray-400 text-sm mb-2">
                            <span className="font-medium text-gray-300">Didn&apos;t receive the email?</span>
                        </p>
                        <ul className="text-gray-500 text-sm space-y-1 list-disc list-inside">
                            <li>Check your spam folder</li>
                            <li>Make sure you entered the correct email</li>
                            <li>Wait a few minutes and try resending</li>
                        </ul>
                    </div>

                    {/* Sign In Link */}
                    <p className="text-gray-400 text-sm">
                        Already verified?{" "}
                        <Link href="/sign-in" className="text-violet-400 hover:text-violet-300">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
