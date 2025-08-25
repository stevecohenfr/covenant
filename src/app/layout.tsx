import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { LogoutBtn } from "./_parts/logoutButton";

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
