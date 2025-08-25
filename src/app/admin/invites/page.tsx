import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { CopyBtn } from "@/components/CopyBtn";

function genCode() {
    // code court lisible, unique à 10 chars
    return "INVITE-" + Math.random().toString(36).slice(2, 8).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

async function createInviteAction(formData: FormData) {
    "use server";
    await requireAdmin();
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const code = "INVITE-" + (formData.get("code") as string || "").trim().toUpperCase() || genCode();
    if (!email) throw new Error("email_required");

    await prisma.invite.upsert({
        where: { email },
        update: { code, used: false, usedAt: null },
        create: { email, code },
    });

    revalidatePath("/admin/invites");
}

async function deleteInviteAction(id: string) {
    "use server";
    await requireAdmin();
    await prisma.invite.delete({ where: { id } });
    revalidatePath("/admin/invites");
}

export default async function AdminInvitesPage() {
    await requireAdmin();

    const invites = await prisma.invite.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Invitations</h1>

            {/* Création */}
            <form action={createInviteAction} className="flex flex-wrap items-end gap-3 border rounded-xl p-4 bg-white">
                <div className="flex-1 min-w-[280px]">
                    <label className="text-sm text-gray-600">Email</label>
                    <input name="email" type="email" required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="ami@exemple.com" />
                </div>
                <div>
                    <label className="text-sm text-gray-600">Code (optionnel)</label>
                    <input name="code" className="mt-1 border rounded-lg px-3 py-2 text-sm" placeholder="auto si vide" />
                </div>
                <button className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm">Générer</button>
            </form>

            {/* Liste */}
            <div className="bg-white border rounded-xl">
                <div className="p-3 border-b text-sm text-gray-600">Invites récentes</div>
                <div className="divide-y">
                    {invites.map((inv) => (
                        <div key={inv.id} className="p-3 flex items-center gap-3">
                            <div className="min-w-60">
                                <div className="font-medium">{inv.email}</div>
                                <div className="text-xs text-gray-500">Créée le {new Date(inv.createdAt).toLocaleString("fr-FR")}</div>
                            </div>
                            <code className={`px-2 py-1 rounded ${inv.used ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700"}`}>
                                {inv.code}
                            </code>
                            <span className={`ml-2 text-xs ${inv.used ? "text-gray-500" : "text-green-700"}`}>
                {inv.used ? `Utilisée ${inv.usedAt ? "le " + new Date(inv.usedAt).toLocaleDateString("fr-FR") : ""}` : "Disponible"}
              </span>
                            <div className="ml-auto flex items-center gap-2">
                                <CopyBtn text={inv.code} />
                                <form action={deleteInviteAction.bind(null, inv.id)}>
                                    <button className="text-sm underline">Supprimer</button>
                                </form>
                            </div>
                        </div>
                    ))}
                    {invites.length === 0 && <div className="p-3 text-sm text-gray-500">Aucune invitation.</div>}
                </div>
            </div>
        </div>
    );
}
