import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";

    const categories = await prisma.category.findMany({
        where: {
            name: { contains: q, mode: "insensitive" },
        },
        orderBy: { name: "asc" },
        take: 10,
    });

    return NextResponse.json(categories);
}
