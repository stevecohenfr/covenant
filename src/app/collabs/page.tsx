import { prisma } from "@/lib/prisma";
import CollabCard from "@/components/collabs/CollabCard";
import { requireAuth } from "@/lib/requireAuth";
import { Prisma } from "@prisma/client"; // <-- importe Prisma pour QueryMode

const PAGE_SIZE = 12;

export default async function CollabsPage({ searchParams, }: any) {
    await requireAuth(); // retire si totalement public

    const page = Math.max(1, Number(searchParams.page ?? "1"));
    const q = (searchParams.q ?? "").trim();
    const mode = Prisma.QueryMode.insensitive;

    const where: Prisma.CollabWhereInput = {
        isPublic: true,
        ...(q
            ? {
                OR: [
                    { product: { contains: q, mode } },
                    { comment: { contains: q, mode } },
                    // relation 1–1 (ou 1–0..1) : utiliser `is`
                    { brand: { is: { name: { contains: q, mode } } } },
                    // (optionnel) chercher aussi par tag
                    // { tags: { some: { tag: { name: { contains: q, mode } } } } },
                ],
            }
            : {}),
    };

    const [rows, total] = await Promise.all([
        prisma.collab.findMany({
            where,
            include: {
                brand: true,
                tags: { include: { tag: true } },
            },
            orderBy: { updatedAt: "desc" },
            take: PAGE_SIZE,
            skip: (page - 1) * PAGE_SIZE,
        }),
        prisma.collab.count({ where }),
    ]);

    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold">Collabs publiques</h1>
                <form className="ml-auto">
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        placeholder="Rechercher une marque, un produit…"
                        className="border rounded-lg px-3 py-2 text-sm"
                    />
                </form>
            </header>

            {rows.length === 0 ? (
                <div className="text-gray-500">Aucune collab pour le moment.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rows.map((c) => (
                        <CollabCard key={c.id} c={c as any} />
                    ))}
                </div>
            )}

            {pages > 1 && (
                <nav className="flex items-center justify-center gap-2">
                    <PaginationLink page={1} current={page} label="«" />
                    <PaginationLink page={Math.max(1, page - 1)} current={page} label="‹" />
                    <span className="text-sm text-gray-600">
            Page {page} / {pages}
          </span>
                    <PaginationLink page={Math.min(pages, page + 1)} current={page} label="›" />
                    <PaginationLink page={pages} current={page} label="»" />
                </nav>
            )}
        </div>
    );
}

function PaginationLink({ page, current, label, q }: { page: number; current: number; label: string; q?: string }) {
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    if (q) sp.set("q", q);
    return (
        <a
            href={`?${sp.toString()}`}
            className={`px-3 py-1 rounded border text-sm ${
                page === current ? "bg-gray-900 text-white border-gray-900" : "bg-white hover:bg-gray-50"
            }`}
            aria-current={page === current ? "page" : undefined}
        >
            {label}
        </a>
    );
}
