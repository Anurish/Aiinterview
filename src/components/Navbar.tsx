"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Menu, X, Sparkles, LogOut, User } from "lucide-react";
import { useState } from "react";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/history", label: "History" },
    { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const isLoading = status === "loading";
    const isSignedIn = status === "authenticated";

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
                        {isLoading ? (
                            <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse" />
                        ) : isSignedIn ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full ring-2 ring-violet-500/50 hover:ring-violet-500 transition-all"
                                >
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            className="h-8 w-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">
                                                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                                            </span>
                                        </div>
                                    )}
                                </button>

                                {/* User Dropdown */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-gray-900 border border-white/10 shadow-xl py-1">
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <p className="text-sm font-medium text-white truncate">
                                                {session.user?.name}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                signOut({ callbackUrl: "/" });
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-3">
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
                            </div>
                        )}

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
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="border-t border-white/10 bg-black/95 backdrop-blur-xl">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "block px-4 py-3 rounded-xl text-base font-medium transition-all transform",
                                    pathname === link.href
                                        ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-white border border-violet-500/30"
                                        : "text-gray-400 hover:text-white hover:bg-white/5 active:scale-95"
                                )}
                                style={{
                                    transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms"
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Mobile Sign In/Up buttons for non-authenticated users */}
                        {!isSignedIn && status !== "loading" && (
                            <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                                <Link
                                    href="/sign-in"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-3 rounded-xl text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 text-center"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/sign-up"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-violet-500 to-indigo-600 text-center"
                                >
                                    Get Started Free
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
