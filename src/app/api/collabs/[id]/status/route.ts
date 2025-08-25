import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';


export async function POST(req: NextRequest, { params }: { params: { id: string } }){
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ ok:false }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!me) return NextResponse.json({ ok:false }, { status: 401 });


    const body = await req.json();
    const to = body.to as any;
    const collab = await prisma.collab.findUnique({ where: { id: params.id } });
    if (!collab || collab.userId !== me.id) return NextResponse.json({ ok:false }, { status: 404 });


    const data: any = { status: to };
    if (to === 'CLOSED') { data.isCompleted = true; data.completedAt = new Date(); }


    const updated = await prisma.collab.update({ where: { id: collab.id }, data });
    await prisma.pipelineEvent.create({ data: { collabId: collab.id, from: collab.status as any, to, authorId: me.id, note: body.note ?? null } });
    return NextResponse.json({ ok:true, status: updated.status });
}
