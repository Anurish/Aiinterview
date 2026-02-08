"use client";

import { useState } from "react";
import { User, CreditCard, Trash2, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateUserName, deleteUserAccount } from "@/actions/user";
import { createStripePortalSession } from "@/actions/stripe";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

interface SettingsClientProps {
    user: {
        id: string;
        name: string | null;
        email: string | null;
        plan: string;
        image: string | null;
    };
    subscription: {
        status: string;
        currentPeriodEnd: Date;
    } | null;
}

export function SettingsClient({ user, subscription }: SettingsClientProps) {
    const [activeTab, setActiveTab] = useState("profile");
    const [name, setName] = useState(user.name || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const { update } = useSession();
    const router = useRouter();

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "billing", label: "Billing", icon: CreditCard },
        { id: "danger", label: "Danger Zone", icon: Trash2 },
    ];

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            await updateUserName(name);
            await update({ name }); // Update client-side session
            setMessage({ type: "success", text: "Profile updated successfully" });
            router.refresh();
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update profile" });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePortalSession = async () => {
        try {
            await createStripePortalSession();
        } catch (error) {
            setMessage({ type: "error", text: "Failed to redirect to billing portal" });
        }
    };


    const handleDeleteAccount = async () => {
        if (confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
            setIsDeleting(true);
            try {
                await deleteUserAccount();
                await signOut({ redirect: false });
                window.location.href = "/";
            } catch (error) {
                setMessage({ type: "error", text: "Failed to delete account" });
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 space-y-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            activeTab === tab.id
                                ? "bg-violet-500/10 text-violet-400"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </aside>

            {/* Content */}
            <div className="flex-1 max-w-2xl">
                {activeTab === "profile" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-1">Profile Settings</h2>
                            <p className="text-sm text-gray-400">Manage your account information</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4 p-6 rounded-xl bg-white/5 border border-white/10">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Display Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Email Address</label>
                                <input
                                    type="email"
                                    value={user.email || ""}
                                    disabled
                                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500">Email cannot be changed</p>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                {message && (
                                    <p className={cn("text-sm", message.type === "success" ? "text-green-400" : "text-red-400")}>
                                        {message.text}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="ml-auto px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === "billing" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-1">Billing & Subscription</h2>
                            <p className="text-sm text-gray-400">Manage your subscription plan</p>
                        </div>

                        <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Current Plan</p>
                                    <h3 className="text-2xl font-bold text-white">{user.plan}</h3>
                                </div>
                                {user.plan === "PRO" && (
                                    <div className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium border border-violet-500/30">
                                        Active
                                    </div>
                                )}
                            </div>

                            {subscription && (
                                <div className="mb-6 p-4 rounded-lg bg-black/30 border border-white/5">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Check className="h-4 w-4 text-green-400" />
                                        <span>Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handlePortalSession}
                                className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Manage Subscription
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "danger" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-red-400 mb-1">Danger Zone</h2>
                            <p className="text-sm text-gray-400">Irreversible account actions</p>
                        </div>

                        <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                            <h3 className="text-lg font-medium text-white mb-2">Delete Account</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                Permanently remove your account and all of its content from the platform. This action is not reversible, so please continue with caution.
                            </p>

                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
