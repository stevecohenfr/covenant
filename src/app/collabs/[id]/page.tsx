import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { moneyCentsToStr } from "@/lib/format";
import { StatusBadge } from "@/components/collabs/StatusBadge";
import { StatusSelect } from "@/components/collabs/StatusSelect";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function CollabDetailPage({ params }: any) {
    await requireAuth(); // retire si totalement public

    const c = await prisma.collab.findUnique({
        where: { id: params.id },
        include: {
            brand: true,
            category: true,
            user: { select: { id: true, name: true, email: true } },
            tags: { include: { tag: true } },
            pipelineEvents: {
                orderBy: { createdAt: "asc" },
                include: { author: { select: { name: true, email: true } } },
            },
            attachments: true,
        },
    });

    /*if (!c || (!c.isPublic && c.userId !== (await (await requireAuth()).user?.id))) {
        // si tu gardes requireAuth, tu as session en haut; sinon adapte
    }*/
    if (!c) return notFound();

    const amount = moneyCentsToStr(c.amount ?? null, c.currency ?? "EUR");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-[260px]">
                    <h1 className="text-2xl font-semibold">{c.brand.name}</h1>
                    <div className="text-gray-500">{c.product}</div>
                    <div className="text-sm text-gray-500 mt-1">
                        {c.category?.name ?? "—"} • {(c.language || "N/C").toUpperCase()} • {c.country || "—"}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <StatusBadge status={c.status} />
                    {/* Inline status update */}
                    <StatusSelect collabId={c.id} value={c.status} />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard title="Montant" value={amount} sub={c.paymentTerms || "—"} />
                <SummaryCard title="Paiement" value={c.paid ? "Payé" : "En attente"} sub={c.paidAt ? new Date(c.paidAt).toLocaleDateString("fr-FR") : "—"} />
                <SummaryCard title="Publication" value={c.isPublic ? "Publique" : "Privée"} sub={c.isCompleted ? "Terminée" : "En cours"} />
            </div>

            {/* Info principales */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations</CardTitle>
                    <CardDescription>Détails généraux de la collaboration</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Marque">
                        <a href={c.brand.website ?? "#"} target="_blank" rel="noreferrer" className="underline">
                            {c.brand.name}
                        </a>
                    </InfoRow>
                    <InfoRow label="Catégorie">{c.category?.name ?? "—"}</InfoRow>

                    <InfoRow label="Contrat">{c.contractSigned ? "Signé" : "Non signé"}</InfoRow>
                    <InfoRow label="Prix négocié">{c.negotiatedPrice ? "Oui" : "Non"}</InfoRow>

                    <InfoRow label="Accessoires négociés">
                        {c.accessoriesNegotiated ? (c.accessoriesDetails || "Oui") : "Non"}
                    </InfoRow>

                    <InfoRow label="Droits d’usage">
                        {[
                            c.usagePaidMedia ? "Paid media" : null,
                            c.usageDuration ? `Durée: ${c.usageDuration}` : null,
                            c.usageRegions?.length ? `Régions: ${c.usageRegions.join(", ")}` : null,
                            c.exclusivityUntil ? `Exclusivité: ${new Date(c.exclusivityUntil).toLocaleDateString("fr-FR")}` : null,
                        ]
                            .filter(Boolean)
                            .join(" • ") || "—"}
                    </InfoRow>

                    <InfoRow label="Méthode de paiement">{c.paymentMethod || "—"}</InfoRow>
                    <InfoRow label="Conditions de paiement">{c.paymentTerms || "—"}</InfoRow>

                    <InfoRow label="Contact email">{c.contactEmail || "—"}</InfoRow>
                    <InfoRow label="Contact téléphone">{c.contactPhone || "—"}</InfoRow>
                </CardContent>
            </Card>

            {/* Livrables */}
            <Card>
                <CardHeader>
                    <CardTitle>Livrables</CardTitle>
                    <CardDescription>Plateformes et contenus prévus</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {renderDeliverables(c.deliverables) || <div className="text-sm text-gray-500">—</div>}
                </CardContent>
            </Card>

            {/* Liens + Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Liens de publication</CardTitle>
                        <CardDescription>Posts, vidéos, stories publiés</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {c.publicationLinks.length ? (
                            c.publicationLinks.map((u, i) => (
                                <a
                                    key={i}
                                    href={u}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm underline text-gray-700 hover:text-black truncate max-w-[16rem]"
                                    title={u}
                                >
                                    {safeHost(u)}
                                </a>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500">—</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tags</CardTitle>
                        <CardDescription>Mots-clés de la collaboration</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {c.tags.length ? (
                            c.tags.map(({ tag }) => (
                                <span key={tag.id} className="px-2 py-1 rounded-full text-xs border bg-white">
                  {tag.label}
                </span>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500">—</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Notes</CardTitle>
                    <CardDescription>Commentaire public & notes privées</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Commentaire public</div>
                        <div className="rounded-lg border bg-white p-3 text-sm min-h-[60px]">{c.comment || "—"}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Notes privées</div>
                        <div className="rounded-lg border bg-white p-3 text-sm min-h-[60px]">{c.privateNotes || "—"}</div>
                    </div>
                </CardContent>
            </Card>

            {/* Pièces jointes */}
            <Card>
                <CardHeader>
                    <CardTitle>Pièces jointes</CardTitle>
                    <CardDescription>Contrats, briefs, factures</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {c.attachments.length ? (
                        c.attachments.map((a) => (
                            <a
                                key={a.id}
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 rounded border bg-white text-sm hover:bg-gray-50"
                            >
                                {a.kind.toUpperCase()}
                            </a>
                        ))
                    ) : (
                        <div className="text-sm text-gray-500">—</div>
                    )}
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Historique</CardTitle>
                    <CardDescription>Changements de statut</CardDescription>
                </CardHeader>
                <CardContent>
                    {c.pipelineEvents.length ? (
                        <ul className="relative pl-4">
                            {c.pipelineEvents.map((e) => (
                                <li key={e.id} className="mb-4">
                                    <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-gray-900" />
                                    <div className="text-sm">
                                        <span className="font-medium">{formatStatus(e.to)}</span>{" "}
                                        <span className="text-gray-500">
                      — {new Date(e.createdAt).toLocaleString("fr-FR")}
                    </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {e.author?.name || e.author?.email} {e.note ? `• ${e.note}` : ""}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-sm text-gray-500">—</div>
                    )}
                </CardContent>
            </Card>

            {/* Footer actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                <div>
                    Créée le {new Date(c.createdAt).toLocaleDateString("fr-FR")} •
                    &nbsp;Maj {new Date(c.updatedAt).toLocaleDateString("fr-FR")}
                </div>
                <Link href="/collabs" className="underline hover:no-underline">
                    ← Retour à la liste
                </Link>
            </div>
        </div>
    );
}

/* ───────────────── helpers ───────────────── */

function SummaryCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
    return (
        <Card className="bg-white rounded-2xl shadow-sm border">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
                <div className="text-2xl font-semibold">{value}</div>
                {sub ? <CardDescription className="mt-1">{sub}</CardDescription> : null}
            </CardHeader>
        </Card>
    );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-3 items-start">
            <div className="col-span-1 text-sm text-gray-500">{label}</div>
            <div className="col-span-2 text-sm">{children}</div>
        </div>
    );
}

function safeHost(u: string) {
    try {
        const h = new URL(u).hostname.replace(/^www\./, "");
        return h;
    } catch {
        return u;
    }
}

function formatStatus(s: string) {
    const map: Record<string, string> = {
        PROSPECTION: "Prospection",
        WAITING_REPLY: "Attente réponse",
        NEGOTIATION: "Négociation",
        AGREED: "Accord conclu",
        WAITING_PRODUCT: "Attente produit",
        PRODUCTION: "Production",
        IN_REVIEW: "En review",
        PUBLISHED: "Publié",
        INVOICED: "Facturé",
        WAITING_PAYMENT: "Paiement en attente",
        PAID: "Payé",
        CLOSED: "Clôturée",
    };
    return map[s] || s;
}

function renderDeliverables(deliverables: any) {
    if (!deliverables) return null;
    try {
        const d = typeof deliverables === "string" ? JSON.parse(deliverables) : deliverables;
        if (!d.items || !Array.isArray(d.items)) return null;

        return (
            <ul className="space-y-2">
                {d.items.map((it: any, i: number) => (
                    <li
                        key={i}
                        className="flex justify-between items-center rounded-lg border bg-gray-50 px-3 py-2 text-sm"
                    >
                        <div>
                            <span className="font-medium">{it.type}</span>
                            {d.platforms?.[i] ? (
                                <span className="text-gray-500 ml-1">· {d.platforms[i]}</span>
                            ) : null}
                        </div>
                        <div className="text-gray-600">× {it.count ?? 1}</div>
                    </li>
                ))}
            </ul>
        );
    } catch {
        return <div className="text-sm text-gray-500">—</div>;
    }
}

