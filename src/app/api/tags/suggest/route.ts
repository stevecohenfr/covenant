import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";

    const tags = await prisma.tag.findMany({
        where: {
            label: { contains: q, mode: "insensitive" },
        },
        orderBy: { label: "asc" },
        take: 10,
    });

    return NextResponse.json(tags);
}
