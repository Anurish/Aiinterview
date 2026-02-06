"use client";

import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
    onSelect: () => void;
    disabled?: boolean;
    className?: string;
}

export function PricingCard({
    name,
    price,
    period = "/month",
    description,
    features,
    isPopular = false,
    buttonText,
    onSelect,
    disabled = false,
    className,
}: PricingCardProps) {
    return (
        <div
            className={cn(
                "relative flex flex-col p-8 rounded-2xl border transition-all",
                isPopular
                    ? "bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-purple-500/10 border-violet-500/50"
                    : "bg-white/5 border-white/10 hover:border-white/20",
                className
            )}
        >
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium">
                        <Sparkles className="h-4 w-4" />
                        Most Popular
                    </div>
                </div>
            )}

            {/* Plan Info */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">{name}</h3>
                <p className="mt-2 text-sm text-gray-400">{description}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{price}</span>
                    {period && <span className="text-gray-500">{period}</span>}
                </div>
            </div>

            {/* Features */}
            <ul className="flex-1 space-y-4 mb-8">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-violet-500/20 flex-shrink-0">
                            <Check className="h-3 w-3 text-violet-400" />
                        </div>
                        <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* CTA Button */}
            <button
                onClick={onSelect}
                disabled={disabled}
                className={cn(
                    "w-full py-3 rounded-xl font-medium transition-all",
                    isPopular
                        ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:opacity-90"
                        : "bg-white/10 text-white hover:bg-white/20",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                {buttonText}
            </button>
        </div>
    );
}

// Credit Pack Card
interface CreditPackCardProps {
    credits: number;
    price: string;
    originalPrice?: string;
    savings?: string;
    onSelect: () => void;
    disabled?: boolean;
    className?: string;
}

export function CreditPackCard({
    credits,
    price,
    originalPrice,
    savings,
    onSelect,
    disabled = false,
    className,
}: CreditPackCardProps) {
    return (
        <div
            className={cn(
                "relative p-6 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            onClick={disabled ? undefined : onSelect}
        >
            {savings && (
                <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
                    {savings}
                </div>
            )}

            <div className="text-center">
                <p className="text-3xl font-bold text-white">{credits}</p>
                <p className="text-sm text-gray-400">
                    {credits === 1 ? "Interview" : "Interviews"}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="text-xl font-bold text-white">{price}</span>
                    {originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
