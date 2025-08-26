import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const buildDate = new Date().toISOString();

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // URLs statiques de base
    const staticUrls = [
        { loc: "/", changefreq: "weekly", priority: 1.0, lastmod: buildDate },
        { loc: "/collabs", changefreq: "weekly", priority: 0.8, lastmod: buildDate },
        { loc: "/login", changefreq: "monthly", priority: 0.3, lastmod: buildDate },
        { loc: "/register", changefreq: "monthly", priority: 0.3, lastmod: buildDate },
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
