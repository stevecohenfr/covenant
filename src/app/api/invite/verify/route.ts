import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ ok:false, error:"missing_code" }, { status:400 });

    const invite = await prisma.invite.findFirst({ where: { code, used: false }});
    console.log(invite);
    if (!invite) return NextResponse.json({ ok:false, error:"invalid_or_used" }, { status:400 });

    return NextResponse.json({ ok:true, email: invite.email }); // email pré-rempli si tu veux
}
