import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const handler = NextAuth({
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" },
            },
            async authorize(creds) {
                if (!creds?.email || !creds?.password) return null;
                const user = await prisma.user.findUnique({ where: { email: creds.email } });
                if (!user || !user.passwordHash) return null;
                const ok = await bcrypt.compare(creds.password, user.passwordHash);
                if (!ok) return null;
                return { id: user.id, email: user.email, name: user.name ?? user.email } as any;
            },
        }),
    ],
    pages: { signIn: "/login" },
});

export { handler as GET, handler as POST };
