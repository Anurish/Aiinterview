"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock, Check } from "lucide-react";
import { PLANS, CREDIT_PACKS } from "@/lib/stripe";

type PlanType = "pro" | "credit_1" | "credit_3" | "credit_7";

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get("plan") as PlanType;
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!planId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Invalid plan selected</p>
                    <Link href="/pricing" className="text-violet-400 hover:text-violet-300">
                        Back to Pricing
                    </Link>
                </div>
            </div>
        );
    }

    const getPlanDetails = () => {
        if (planId === "pro") {
            return {
                name: PLANS.PRO.name,
                price: "$10/month",
                description: "Pro Subscription",
                features: PLANS.PRO.features,
            };
        }

        const creditMap = {
            credit_1: CREDIT_PACKS.PACK_1,
            credit_3: CREDIT_PACKS.PACK_3,
            credit_7: CREDIT_PACKS.PACK_7,
        };

        const pack = creditMap[planId];
        if (!pack) return null;

        return {
            name: `${pack.credits} Credits`,
            price: "$" + pack.priceUSD,
            description: "One-time purchase",
            features: [
                `${pack.credits} additional interview credits`,
                "Use anytime",
                "No expiration",
            ],
        };
    };

    const planDetails = getPlanDetails();
    if (!planDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Plan not found</p>
                    <Link href="/pricing" className="text-violet-400 hover:text-violet-300">
                        Back to Pricing
                    </Link>
                </div>
            </div>
        );
    }

    const handleCompletePayment = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Payment failed");
            }

            const data = await response.json();

            // In demo mode, data.url will be the success URL
            if (data.url) {
                router.push(data.url);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Payment failed");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-8 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Pricing
                </Link>

                {/* Checkout Card */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                        {/* Order Summary */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Order Summary</h2>
                                <p className="text-gray-400">Review your purchase details</p>
                            </div>

                            {/* Plan Card */}
                            <div className="bg-gray-700/30 rounded-xl p-6 space-y-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Plan</p>
                                    <h3 className="text-xl font-bold text-white">{planDetails.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{planDetails.description}</p>
                                </div>

                                <div className="border-t border-gray-600 pt-4">
                                    <p className="text-gray-400 text-sm">Price</p>
                                    <p className="text-3xl font-bold text-violet-400">{planDetails.price}</p>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-gray-400 text-sm">What&apos;s Included:</p>
                                    {planDetails.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Payment Details</h2>
                                <p className="text-gray-400">Demo mode: Click below to simulate payment</p>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCompletePayment();
                                }}
                                className="space-y-6"
                            >
                                {/* Card Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Card Number
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="4242 4242 4242 4242"
                                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                                            defaultValue="4242 4242 4242 4242"
                                            disabled
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Expiry
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                                                defaultValue="12/25"
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                CVC
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                                                defaultValue="123"
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                                            disabled
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                                        {error}
                                    </div>
                                )}

                                {/* Security Notice */}
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                    <Lock className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-300">
                                        <p className="font-medium">Demo Mode</p>
                                        <p className="mt-1">
                                            No real payment will be processed. Click &quot;Complete Payment&quot; to simulate a successful transaction.
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Complete Payment"
                                    )}
                                </button>

                                {/* Cancel */}
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="w-full px-6 py-3 rounded-lg bg-gray-700/50 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
