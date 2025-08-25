import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import Link from "next/link";
import { moneyCentsToStr } from "@/lib/format";
import type { Collab, Brand, TagOnCollab, Tag } from "@prisma/client";

type CollabWithRefs = Collab & {
    brand: Brand;
    tags: (TagOnCollab & { tag: Tag })[];
};

export default function CollabCard({ c }: { c: CollabWithRefs }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow border">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardTitle className="text-lg">{c.brand.name}</CardTitle>
                        <div className="text-sm text-gray-500">{c.product}</div>
                    </div>
                    <StatusBadge status={c.status} />
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-gray-500">Montant</div>
                        <div className="font-medium">{moneyCentsToStr(c.amount ?? null, c.currency ?? "EUR")}</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-gray-500">Langue / Pays</div>
                        <div className="font-medium">
                            {(c.language || "N/C").toUpperCase()} · {c.country || "—"}
                        </div>
                    </div>
                </div>

                {c.publicationLinks?.length ? (
                    <div className="text-sm">
                        <div className="text-gray-500 mb-1">Liens</div>
                        <div className="flex flex-wrap gap-2">
                            {c.publicationLinks.slice(0,3).map((u, i) => (
                                <a
                                    key={i}
                                    href={u}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="truncate max-w-[12rem] text-xs underline text-gray-700 hover:text-black"
                                    title={u}
                                >
                                    {new URL(u).hostname.replace("www.","")}…
                                </a>
                            ))}
                        </div>
                    </div>
                ) : null}

                {c.tags?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                        {c.tags.slice(0,6).map((t) => (
                            <span
                                key={t.tagId}
                                className="px-2 py-0.5 rounded-full text-xs border bg-white"
                            >
                {t.tag.label}
              </span>
                        ))}
                    </div>
                ) : null}
            </CardContent>

            <CardFooter className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    Maj {new Date(c.updatedAt).toLocaleDateString("fr-FR")}
                </div>
                <Link
                    href={`/collabs/${c.id}`}
                    className="text-sm font-medium underline underline-offset-4 hover:no-underline"
                >
                    Voir
                </Link>
            </CardFooter>
        </Card>
    );
}
