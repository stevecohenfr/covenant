import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const collab = await prisma.collab.update({
            where: { id: params.id },
            data: { isPublic: true },
        });
        return NextResponse.json({ ok: true, collab });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Unable to publish" }, { status: 500 });
    }
}
