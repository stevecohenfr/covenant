import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    const { email, password, code } = await req.json();
    if (!email || !password || !code)
        return NextResponse.json({ ok:false, error:"missing_fields" }, { status:400 });

    const invite = await prisma.invite.findFirst({ where: { email, code, used: false }});
    if (!invite) return NextResponse.json({ ok:false, error:"invalid_invite" }, { status:400 });

    // crée ou met à jour le user avec un mdp
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash: hash },
        create: { email, passwordHash: hash },
    });

    await prisma.invite.update({ where: { email }, data: { used: true, usedAt: new Date() } });

    return NextResponse.json({ ok:true, userId: user.id });
}
