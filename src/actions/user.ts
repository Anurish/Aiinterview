"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserName(name: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (!name || name.trim().length < 2) {
        throw new Error("Name must be at least 2 characters");
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { name: name.trim() },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteUserAccount() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await prisma.user.delete({
        where: { id: session.user.id },
    });

    return { success: true };
}
