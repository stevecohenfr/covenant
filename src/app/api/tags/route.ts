import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from 'slugify';

export async function POST(req: NextRequest) {
    const { label } = await req.json();
    if (!label?.trim()) {
        return NextResponse.json({ ok:false, error:'missing_label' }, { status:400 });
    }
    const slug = slugify(label.trim(), {
        lower: true,      // tout en minuscule
        strict: true,     // supprime les caractères non alphanumériques
        locale: 'fr',     // gère les accents français
    });
    const t = await prisma.tag.upsert({
        where: { slug },
        update: { label: label || undefined },
        create: { slug, label },
    });
    return NextResponse.json({ ok:true, id: t.id, label: t.label });
}
