import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const collab = await prisma.collab.update({
            where: { id },
            data: { isPublic: true },
        });
        return NextResponse.json({ ok: true, collab });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Unable to publish" }, { status: 500 });
    }
}
