import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/collabs/StatusBadge";
import { StatusSelect } from "@/components/collabs/StatusSelect";
import {PublishButton} from "@/app/_parts/publishButton";
import { VisibilityBadge } from "@/components/collabs/VisibilityBadge";


export default async function Dashboard(){
    const session = await requireAuth();
    const me = await prisma.user.findUnique({ where: { email: session.user!.email! } });


    const [inProgress, completed] = await Promise.all([
        prisma.collab.count({ where: { userId: me!.id, isCompleted: false } }),
        prisma.collab.count({ where: { userId: me!.id, isCompleted: true } }),
    ]);


    const mine = await prisma.collab.findMany({ where: { userId: me!.id }, include: { brand: true }, orderBy: { updatedAt: 'desc' }, take: 12 });


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Bienvenue</h1>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm p-5 border"><div className="text-sm text-gray-500">En cours</div><div className="text-3xl font-semibold">{inProgress}</div></div>
                <div className="bg-white rounded-2xl shadow-sm p-5 border"><div className="text-sm text-gray-500">Terminées</div><div className="text-3xl font-semibold">{completed}</div></div>
                <div className="bg-white rounded-2xl shadow-sm p-5 border"><div className="text-sm text-gray-500">Publications</div><div className="text-3xl font-semibold">{mine.filter(m=>m.isPublic).length}</div></div>
            </div>


            <div className="bg-white rounded-2xl shadow-sm border">
                <div className="p-4 border-b flex items-center justify-between"><h2 className="font-semibold">Mes dernières collabs</h2></div>
                <div className="divide-y">
                    {mine.map(c => (
                        <div key={c.id} className="p-4 flex items-center gap-4">
                            <div className="min-w-48">
                                <div className="font-medium">{c.brand.name}</div>
                                <div className="text-sm text-gray-500">{c.product}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={c.status} />
                                <VisibilityBadge isPublic={c.isPublic} />
                                <PublishButton collabId={c.id} status={c.status} isPublic={c.isPublic} />
                            </div>
                            <div className="ml-auto flex items-center gap-3">
                                <StatusSelect collabId={c.id} value={c.status} />
                                <div className="text-sm text-gray-500">{c.amount ? (c.amount/100).toFixed(0) + ' ' + (c.currency||'') : 'Gift / N.C.'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
