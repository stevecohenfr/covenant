import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { LogoutBtn } from "./_parts/logoutButton";
import type { Metadata } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const TITLE = "Covenant — Collabs, pipelines & deals";
const DESC =
    "Covenant : gérez et partagez vos collaborations, pipelines et deals de contenu en toute simplicité.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE),
    applicationName: "Covenant",
    generator: "Next.js",
    authors: [{ name: "Steve Cohen" }],
    creator: "Steve Cohen",
    publisher: "Steve Cohen",
    keywords: ["Covenant","collab","sponsoring","créateurs","pipeline","CRM","deals"],
    referrer: "origin-when-cross-origin",
    alternates: { canonical: "/" },
    title: {
        default: "Covenant",
        template: "%s — Covenant",
    },
    description: DESC,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
        { media: "(prefers-color-scheme: dark)", color: "#0b132b" },
    ],
    openGraph: {
        type: "website",
        siteName: "Covenant",
        title: TITLE,
        description: DESC,
        url: SITE, // 👈 absolute
        images: [
            {
                url: `${SITE}/og.jpg`, // 👈 absolute
                width: 1200,
                height: 630,
                alt: "Covenant — vue du tableau de collabs",
                type: "image/jpeg",
            },
        ],
        locale: "fr_FR",
    },
    twitter: {
        card: "summary_large_image",
        title: TITLE,
        description: DESC,
        images: [`${SITE}/og.jpg`], // 👈 absolute
    },
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
        other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#0ea5e9" }],
    },
    manifest: "/site.webmanifest",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-video-preview": -1,
            "max-snippet": -1,
        },
    },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession();
    const email = session?.user?.email?.toLowerCase() || "";
    const admins = (process.env.ADMIN_EMAILS || "").toLowerCase();
    const isAdmin = email && admins.includes(email);

    return (
        <html lang="fr" suppressHydrationWarning>
        <body className="bg-gray-50 text-gray-900" suppressHydrationWarning>
        {session && (
            <header className="border-b bg-white shadow-sm">
                <nav className="max-w-6xl mx-auto p-4 flex gap-6 items-center">
                    <Link href="/" className="font-semibold hover:text-blue-600">Dashboard</Link>
                    <Link href="/collabs" className="hover:text-blue-600">Collabs</Link>
                    <Link href="/collabs/new" className="hover:text-blue-600">Ajouter</Link>
                    {isAdmin && <a href="/admin/invites" className="ml-auto">Admin</a>}
                    <div className="ml-auto">
                        <LogoutBtn />
                    </div>
                </nav>
            </header>
        )}
        <main className="max-w-6xl mx-auto p-6">{children}</main>
        </body>
        </html>
    );
}
