import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || "founder@covenant.app";
    //const adminPass  = process.env.ADMIN_PASSWORD || "demo1234";

    // crée juste TON compte admin (aucune collab, aucune marque)
    /*await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash: await bcrypt.hash(adminPass, 10),
            name: "Admin",
            publicCount: 0,
            profile: { create: { country: "FR", languages: ["fr","en"] } }
        }
    });*/

    // tu peux aussi pré-créer 1 invite pour toi si tu préfères ce flow
    await prisma.invite.upsert({
      where: { email: adminEmail },
      update: { code: "ADMIN-INVITE", used: false, usedAt: null },
      create: { email: adminEmail, code: "ADMIN-INVITE" },
    });
}

main().finally(() => prisma.$disconnect());
