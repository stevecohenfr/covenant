// src/app/api/collabs/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { CollabStatus } from "@prisma/client";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> } // 👈 Next 15: params est un Promise
) {
    const { id } = await context.params;

    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!me) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    let body: any = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const to = body?.to as CollabStatus | undefined;
    const note = typeof body?.note === "string" ? body.note : null;

    // Valider la cible
    if (!to || !Object.values(CollabStatus).includes(to)) {
        return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
    }

    const collab = await prisma.collab.findUnique({ where: { id } });
    if (!collab || collab.userId !== me.id) {
        return NextResponse.json({ ok: false }, { status: 404 });
    }

    const data: {
        status: CollabStatus;
        isCompleted?: boolean;
        completedAt?: Date | null;
    } = { status: to };

    if (to === CollabStatus.CLOSED) {
        data.isCompleted = true;
        data.completedAt = new Date();
    }

    const updated = await prisma.collab.update({
        where: { id: collab.id },
        data,
    });

    await prisma.pipelineEvent.create({
        data: {
            collabId: collab.id,
            from: collab.status ?? null,
            to,
            authorId: me.id,
            note,
        },
    });

    return NextResponse.json({ ok: true, status: updated.status });
}
