import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const { name, website, country } = await req.json();
    if (!name?.trim()) {
        return NextResponse.json({ ok:false, error:'missing_name' }, { status:400 });
    }
    const b = await prisma.brand.upsert({
        where: { name },
        update: { website: website || undefined, country: country || undefined },
        create: { name, website, country },
    });
    return NextResponse.json({ ok:true, id: b.id, name: b.name });
}
