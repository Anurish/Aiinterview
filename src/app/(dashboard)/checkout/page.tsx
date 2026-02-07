"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock, Check, CreditCard, Shield } from "lucide-react";
import { PLANS, CREDIT_PACKS } from "@/lib/stripe";

type PlanType = "pro" | "credit_1" | "credit_3" | "credit_7";

function CheckoutContent() {
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
                price: `₹${PLANS.PRO.priceINR}/month`,
                description: "Pro Subscription",
                features: PLANS.PRO.features,
                isSubscription: true,
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
            name: `${pack.credits} Interview Credits`,
            price: `₹${pack.priceINR}`,
            description: "One-time purchase",
            features: [
                `${pack.credits} additional interview credits`,
                "Use anytime, no expiration",
                "Instant activation",
            ],
            isSubscription: false,
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

    const handleProceedToPayment = async () => {
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
                throw new Error(errorData.error || "Failed to create checkout session");
            }

            const data = await response.json();

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
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
                    <div className="p-8 md:p-12">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Complete Your Purchase</h1>
                            <p className="text-gray-400">Review your order and proceed to secure payment</p>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-700/30 rounded-xl p-6 mb-8">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{planDetails.name}</h3>
                                    <p className="text-gray-400 text-sm">{planDetails.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-violet-400">{planDetails.price}</p>
                                    {planDetails.isSubscription && (
                                        <p className="text-gray-500 text-xs">Billed monthly</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-600 pt-4 space-y-2">
                                {planDetails.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
                                {error}
                            </div>
                        )}

                        {/* Security Features */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/20">
                                <Shield className="h-5 w-5 text-green-400" />
                                <span className="text-gray-300 text-sm">Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/20">
                                <CreditCard className="h-5 w-5 text-blue-400" />
                                <span className="text-gray-300 text-sm">Powered by Stripe</span>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-6">
                            <Lock className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-300">
                                <p className="font-medium">Secure Checkout</p>
                                <p className="mt-1">
                                    You&apos;ll be redirected to Stripe&apos;s secure payment page to complete your purchase.
                                    We never store your card details.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleProceedToPayment}
                                disabled={isProcessing}
                                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Redirecting to payment...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-5 w-5" />
                                        Proceed to Payment
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.back()}
                                disabled={isProcessing}
                                className="w-full px-6 py-3 rounded-xl bg-gray-700/50 text-gray-300 font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Terms */}
                        <p className="text-center text-gray-500 text-xs mt-6">
                            By proceeding, you agree to our{" "}
                            <Link href="/terms" className="text-violet-400 hover:text-violet-300">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-violet-400 hover:text-violet-300">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 mt-8 text-gray-500 text-sm">
                    <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>PCI Compliant</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckoutLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<CheckoutLoading />}>
            <CheckoutContent />
        </Suspense>
    );
}
