// src/app/api/collabs/[id]/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> } // 👈 note: Promise
) {
    const { id } = await context.params; // 👈 on attend params

    try {
        const collab = await prisma.collab.update({
            where: { id },
            data: { isPublic: true },
        });
        return NextResponse.json({ ok: true, collab });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { ok: false, error: "Unable to publish" },
            { status: 500 }
        );
    }
}
