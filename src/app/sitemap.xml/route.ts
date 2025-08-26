import { NextResponse } from "next/server";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // URLs statiques de base
    const staticUrls = [
        { loc: "/", changefreq: "weekly", priority: 1.0 },
        { loc: "/collabs", changefreq: "weekly", priority: 0.8 },
        { loc: "/login", changefreq: "monthly", priority: 0.3 },
        { loc: "/register", changefreq: "monthly", priority: 0.3 },
    ];

    // Exemple dynamique : collabs publiques (si tu veux les exposer)
    const collabs = await prisma.collab.findMany({
      where: { isPublic: true },
      select: { id: true, updatedAt: true },
    });
    const collabUrls = collabs.map(c => ({
      loc: `/collabs/${c.id}`,
      lastmod: c.updatedAt.toISOString(),
      changefreq: "weekly",
      priority: 0.6,
    }));

    const urls = [...staticUrls, ...collabUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
        .map(
            (u) => `<url>
  <loc>${baseUrl}${u.loc}</loc>
  ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
  <changefreq>${u.changefreq}</changefreq>
  <priority>${u.priority}</priority>
</url>`
        )
        .join("\n")}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
