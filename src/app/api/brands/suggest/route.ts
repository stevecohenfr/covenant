import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";

    const t = q !== "" ? 10 : undefined;
    const brands = await prisma.brand.findMany({
        where: {
            name: { contains: q, mode: "insensitive" },
        },
        orderBy: { name: "asc" },
        take: t,
    });

    return NextResponse.json(brands);
}
