import { getServerSession } from "next-auth";

export async function requireAdmin() {
    const session = await getServerSession();
    const email = session?.user?.email || "";
    const allowed = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    if (!email || !allowed.includes(email.toLowerCase())) {
        throw new Error("not_admin");
    }
    return session;
}
