"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { PricingCard, CreditPackCard } from "@/components/PricingCard";
import { Sparkles, Check } from "lucide-react";
import { PLANS, CREDIT_PACKS } from "@/lib/stripe";

export default function PricingPage() {
    const router = useRouter();
    const [userPlan, setUserPlan] = useState<string>("FREE");

    useEffect(() => {
        // Fetch user's current plan from dashboard API
        const fetchUserPlan = async () => {
            try {
                const response = await fetch("/api/dashboard");
                if (response.ok) {
                    const data = await response.json();
                    setUserPlan(data.user.plan || "FREE");
                }
            } catch (err) {
                console.log("Could not fetch user plan");
            }
        };

        fetchUserPlan();
    }, []);

    const handleSelectPlan = async (planId: string) => {
        // Redirect to checkout page with plan as query parameter
        router.push(`/checkout?plan=${planId}`);
    };

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            <main className="pt-20 pb-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-6">
                            <Sparkles className="h-4 w-4 text-violet-400" />
                            <span className="text-sm text-violet-300">Simple Pricing</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Choose Your Plan
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Start free and upgrade as you grow. All plans include AI-powered feedback.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                        <PricingCard
                            name="Free"
                            price="₹0"
                            period=""
                            description="Perfect for getting started"
                            features={[...PLANS.FREE.features]}
                            buttonText="Get Started Free"
                            onSelect={() => router.push("/sign-up")}
                        />

                        <PricingCard
                            name="Pro"
                            price={`₹${PLANS.PRO.priceINR}`}
                            period="/month"
                            description="For serious interview preparation"
                            features={[...PLANS.PRO.features]}
                            isPopular={true}
                            buttonText={userPlan === "PRO" ? "Current Plan" : "Upgrade to Pro"}
                            onSelect={() => handleSelectPlan("pro")}
                            disabled={userPlan === "PRO"}
                        />
                    </div>

                    {/* Credit Packs */}
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Or Buy Interview Credits
                            </h2>
                            <p className="text-gray-400">
                                Pay-as-you-go option for occasional practice
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <CreditPackCard
                                credits={CREDIT_PACKS.PACK_1.credits}
                                price={`₹${CREDIT_PACKS.PACK_1.priceINR}`}
                                onSelect={() => handleSelectPlan("credit_1")}
                            />
                            <CreditPackCard
                                credits={CREDIT_PACKS.PACK_3.credits}
                                price={`₹${CREDIT_PACKS.PACK_3.priceINR}`}
                                originalPrice="₹297"
                                savings="17% off"
                                onSelect={() => handleSelectPlan("credit_3")}
                            />
                            <CreditPackCard
                                credits={CREDIT_PACKS.PACK_7.credits}
                                price={`₹${CREDIT_PACKS.PACK_7.priceINR}`}
                                originalPrice="₹693"
                                savings="28% off"
                                onSelect={() => handleSelectPlan("credit_7")}
                            />
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="max-w-3xl mx-auto mt-24">
                        <h2 className="text-2xl font-bold text-white text-center mb-8">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {[
                                {
                                    q: "What's included in the free plan?",
                                    a: "The free plan includes 3 mock interviews per month, beginner-level questions, and basic text feedback.",
                                },
                                {
                                    q: "Can I cancel my Pro subscription anytime?",
                                    a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
                                },
                                {
                                    q: "Do credits expire?",
                                    a: "No, interview credits never expire. Use them whenever you're ready.",
                                },
                                {
                                    q: "What payment methods do you accept?",
                                    a: "We accept all major credit cards, debit cards, and UPI payments through Stripe.",
                                },
                            ].map((faq, index) => (
                                <div
                                    key={index}
                                    className="p-6 rounded-xl bg-white/5 border border-white/10"
                                >
                                    <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                                    <p className="text-gray-400">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
