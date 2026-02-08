import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/sign-in");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true },
    });

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
            <SettingsClient
                user={{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    plan: user.plan,
                    image: user.image
                }}
                subscription={user.subscription}
            />
        </div>
    );
}
