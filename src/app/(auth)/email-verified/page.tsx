"use client";

import Link from "next/link";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";

export default function EmailVerifiedPage() {
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
                    {/* Success Icon */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center mb-6">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-3">
                        Email Verified!
                    </h1>
                    <p className="text-gray-400 mb-8">
                        Your email has been successfully verified. You can now sign in to your account and start practicing interviews.
                    </p>

                    {/* Sign In Button */}
                    <Link
                        href="/sign-in"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        Sign In to Your Account
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
