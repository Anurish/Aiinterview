"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/history", label: "History" },
    { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            InterviewAI
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    pathname === link.href
                                        ? "bg-white/10 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <Link
                                href="/sign-in"
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/sign-up"
                                className="rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
                            >
                                Get Started
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "h-9 w-9 ring-2 ring-violet-500/50",
                                    },
                                }}
                            />
                        </SignedIn>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "block px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                    pathname === link.href
                                        ? "bg-white/10 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
