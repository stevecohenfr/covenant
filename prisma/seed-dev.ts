import { PrismaClient, CollabStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function rand<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function pick<T>(arr: T[], n: number) {
    const a = [...arr]; const out: T[] = [];
    while (out.length < n && a.length) out.push(a.splice(Math.floor(Math.random()*a.length),1)[0]);
    return out;
}

async function main() {
    console.log('Seeding…');

    // --- Tags ---
    const tagsData = [
        { slug: 'tech', label: 'Technologie' },
        { slug: 'scooter', label: 'Trottinette' },
        { slug: 'ev', label: 'Véhicule électrique' },
        { slug: 'beauty', label: 'Beauté' },
        { slug: 'gaming', label: 'Gaming' },
        { slug: 'fashion', label: 'Mode' },
        { slug: 'food', label: 'Alimentation' },
        { slug: 'travel', label: 'Voyage' },
        { slug: 'energy', label: 'Énergie' },
        { slug: 'fitness', label: 'Fitness' },
        { slug: 'outdoor', label: 'Outdoor' },
        { slug: 'luxury', label: 'Luxe' },
    ];
    const tags = [];
    for (const t of tagsData) {
        tags.push(await prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t }));
    }

    // --- Categories ---
    const catNames = [
        'Technologie', 'Mobilité', 'Beauté', 'Gaming',
        'Mode', 'Sport', 'Voyage', 'Maison', 'Énergie', 'Food & Drinks'
    ];
    const categories = [];
    for (const c of catNames) {
        categories.push(await prisma.category.upsert({ where: { name: c }, update: {}, create: { name: c } }));
    }

    // --- Brands ---
    const brandsData = [
        { name: 'EcoFlow', website: 'https://ecoflow.com', country: 'CN' },
        { name: 'Insta360', website: 'https://insta360.com', country: 'CN' },
        { name: 'DJI', website: 'https://dji.com', country: 'CN' },
        { name: 'Nike', website: 'https://nike.com', country: 'US' },
        { name: 'Adidas', website: 'https://adidas.com', country: 'DE' },
        { name: 'L’Oréal', website: 'https://loreal.com', country: 'FR' },
        { name: 'Sephora', website: 'https://sephora.com', country: 'FR' },
        { name: 'Decathlon', website: 'https://decathlon.com', country: 'FR' },
        { name: 'Logitech', website: 'https://logitech.com', country: 'CH' },
        { name: 'ASUS ROG', website: 'https://rog.asus.com', country: 'TW' },
        { name: 'GoPro', website: 'https://gopro.com', country: 'US' },
        { name: 'Red Bull', website: 'https://redbull.com', country: 'AT' },
        { name: 'Samsung', website: 'https://samsung.com', country: 'KR' },
        { name: 'Sony', website: 'https://sony.com', country: 'JP' },
        { name: 'Patagonia', website: 'https://patagonia.com', country: 'US' },
        { name: 'Canyon', website: 'https://canyon.com', country: 'DE' },
        { name: 'VanMoof', website: 'https://vanmoof.com', country: 'NL' },
        { name: 'Acer', website: 'https://acer.com', country: 'TW' },
        { name: 'Huawei', website: 'https://consumer.huawei.com', country: 'CN' },
        { name: 'Xiaomi', website: 'https://xiaomi.com', country: 'CN' },
        { name: 'Anker', website: 'https://anker.com', country: 'CN' },
    ];
    const brands = [];
    for (const b of brandsData) {
        const brand = await prisma.brand.upsert({ where: { name: b.name }, update: {}, create: b });
        brands.push(brand);

        // Taguer quelques marques
        const brandTagLinks = pick(tags, 1 + Math.floor(Math.random()*3));
        for (const t of brandTagLinks) {
            await prisma.tagOnBrand.upsert({
                where: { brandId_tagId: { brandId: brand.id, tagId: t.id } },
                update: {},
                create: { brandId: brand.id, tagId: t.id },
            });
        }

        // Contacts par marque
        const contacts = [
            { email: `press@${b.name.toLowerCase().replace(/[^a-z0-9]/g,'')}.com`, phone: '+33123456789', language: 'fr', role: 'PR', verified: true },
            { email: `marketing@${b.name.toLowerCase().replace(/[^a-z0-9]/g,'')}.com`, phone: '+442012345678', language: 'en', role: 'Marketing', verified: Math.random() > 0.5 },
        ];
        for (const c of contacts) {
            await prisma.contact.create({ data: { ...c, brandId: brand.id } });
        }
    }

    // --- Users + Profiles ---
    const users = [];

    // Compte de connexion
    const me = await prisma.user.upsert({
        where: { email: 'founder@covenant.app' },
        update: {},
        create: {
            email: 'founder@covenant.app',
            passwordHash: await bcrypt.hash('demo1234', 10),
            name: 'Founder',
            profile: {
                create: {
                    country: 'FR',
                    languages: ['fr','en'],
                    bio: 'Fondateur et créateur tech.',
                    instagram: 'founder_tech',
                    igFollowers: 12000,
                    youtube: 'founderYT',
                    ytFollowers: 45000,
                    tiktok: 'founderTT',
                    ttFollowers: 38000,
                }
            }
        }
    });
    users.push(me);

    // 7 autres utilisateurs
    const userCountries = ['FR','US','DE','CN','ES','IT','GB','NL'];
    for (let i = 1; i <= 7; i++) {
        const email = `user${i}@test.com`;
        const u = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                passwordHash: await bcrypt.hash('password123', 10),
                name: `Influenceur ${i}`,
                profile: {
                    create: {
                        country: userCountries[i % userCountries.length],
                        languages: i % 2 === 0 ? ['fr','en'] : ['en'],
                        bio: `Bio de l’influenceur ${i}`,
                        instagram: `influ${i}`,
                        igFollowers: 1500 * i,
                        youtube: `yt${i}`,
                        ytFollowers: 4000 * i,
                        tiktok: `tt${i}`,
                        ttFollowers: 6500 * i,
                    }
                }
            }
        });
        users.push(u);
    }

    // --- Collabs ---
    // Paramètres pour livrables
    const PLATFORM_TYPES: Record<string, string[]> = {
        youtube: ['Intégration vidéo', 'Vidéo complète', 'Short'],
        instagram: ['Post', 'Story', 'Reel'],
        tiktok: ['Vidéo', 'Live'],
        x: ['Post'],
        facebook: ['Post', 'Story'],
    };
    const platforms = Object.keys(PLATFORM_TYPES);

    const allCollabs = [];

    // Quelques collabs pour "me" (le compte de connexion)
    for (let i = 0; i < 12; i++) {
        const brand = rand(brands);
        const cat = rand(categories);
        const plat = pick(platforms, 1 + Math.floor(Math.random()*3));
        const items = plat.map(p => ({ type: rand(PLATFORM_TYPES[p]), count: 1 + Math.floor(Math.random()*2) }));

        const isCompleted = Math.random() > 0.4;
        const isPublic = isCompleted && Math.random() > 0.3;
        const paid = isCompleted && Math.random() > 0.5;
        const amount = paid ? (40000 + Math.floor(Math.random()*150000)) : null; // cents

        const statusPath: CollabStatus[] = [
            CollabStatus.PROSPECTION,
            CollabStatus.NEGOTIATION,
            CollabStatus.AGREED,
            CollabStatus.WAITING_PRODUCT,
            CollabStatus.PRODUCTION,
            CollabStatus.IN_REVIEW,
            CollabStatus.PUBLISHED,
            CollabStatus.INVOICED,
            CollabStatus.WAITING_PAYMENT,
            CollabStatus.PAID,
            CollabStatus.CLOSED,
        ];
        // Choisir un statut final plausible en fonction de completed
        const finalIndex = isCompleted ? (7 + Math.floor(Math.random()*4)) : (2 + Math.floor(Math.random()*3)); // entre AGREED et PUBLISHED si pas terminé
        const finalStatus = statusPath[Math.min(finalIndex, statusPath.length-1)];

        const c = await prisma.collab.create({
            data: {
                userId: me.id,
                brandId: brand.id,
                product: `Produit ${brand.name} — ${1 + Math.floor(Math.random()*999)}`,
                categoryId: cat.id,
                isCompleted,
                isPublic,
                completedAt: isCompleted ? new Date(Date.now() - Math.floor(Math.random()*30)*86400000) : null,
                contractSigned: Math.random() > 0.5,
                negotiatedPrice: Math.random() > 0.3,
                accessoriesNegotiated: Math.random() > 0.6,
                accessoriesDetails: Math.random() > 0.5 ? 'Batterie + trépied' : null,
                deliverables: { platforms: plat, items },
                usagePaidMedia: Math.random() > 0.5,
                usageDuration: Math.random() > 0.5 ? '3 mois' : null,
                usageRegions: ['FR','EU','US'].filter(()=> Math.random() > 0.4),
                exclusivityUntil: Math.random() > 0.7 ? new Date(Date.now() + 60*86400000) : null,
                currency: 'EUR',
                amount,
                paid,
                paidAt: paid ? new Date(Date.now() - 5*86400000) : null,
                paymentMethod: paid ? rand(['virement','paypal']) : null,
                paymentTerms: rand(['À réception','Net30','Net45','Net60']),
                language: rand(['fr','en']),
                country: rand(['FR','US','DE','ES']),
                contactEmail: `pr@${brand.name.toLowerCase().replace(/[^a-z0-9]/g,'')}.com`,
                contactPhone: '+33123456789',
                status: finalStatus,
                publicationLinks: isPublic ? ['https://youtube.com/watch?v=dummy', 'https://instagram.com/p/dummy'].slice(0, 1 + Math.floor(Math.random()*2)) : [],
                comment: rand(['Super collab','RAS','Brief clair','Timing serré']),
                privateNotes: Math.random() > 0.6 ? 'Négocier droits d’usage si renouvellement' : null,
            }
        });

        allCollabs.push(c);

        // Tags sur la collab
        for (const t of pick(tags, 1 + Math.floor(Math.random()*3))) {
            await prisma.tagOnCollab.create({ data: { collabId: c.id, tagId: t.id } });
        }

        // Historique pipeline
        let prev: CollabStatus | null = null;
        for (let s = 0; s <= statusPath.indexOf(finalStatus); s++) {
            const to = statusPath[s];
            await prisma.pipelineEvent.create({
                data: {
                    collabId: c.id,
                    from: prev,
                    to,
                    authorId: me.id,
                    note: rand([null,'OK','Validé par la marque','Contenu livré']),
                }
            });
            prev = to;
        }

        // Attachments (optionnels)
        if (Math.random() > 0.7) {
            await prisma.attachment.create({
                data: { collabId: c.id, kind: rand(['contract','brief','invoice']), url: 'https://example.com/file.pdf' }
            });
        }
    }

    // Collabs pour les autres users
    for (const u of users.filter(x => x.id !== me.id)) {
        const count = 3 + Math.floor(Math.random()*5);
        for (let i = 0; i < count; i++) {
            const brand = rand(brands);
            const cat = rand(categories);
            const plat = pick(platforms, 1 + Math.floor(Math.random()*3));
            const items = plat.map(p => ({ type: rand(PLATFORM_TYPES[p]), count: 1 + Math.floor(Math.random()*2) }));

            const isCompleted = Math.random() > 0.5;
            const isPublic = isCompleted && Math.random() > 0.5;
            const paid = isCompleted && Math.random() > 0.5;
            const amount = paid ? (30000 + Math.floor(Math.random()*120000)) : null;

            const path: CollabStatus[] = [
                CollabStatus.PROSPECTION,
                CollabStatus.NEGOTIATION,
                CollabStatus.AGREED,
                CollabStatus.WAITING_PRODUCT,
                CollabStatus.PRODUCTION,
                CollabStatus.IN_REVIEW,
                CollabStatus.PUBLISHED,
                CollabStatus.INVOICED,
                CollabStatus.WAITING_PAYMENT,
                CollabStatus.PAID,
                CollabStatus.CLOSED,
            ];
            const final = isCompleted ? rand([CollabStatus.PUBLISHED, CollabStatus.PAID, CollabStatus.CLOSED]) : rand([CollabStatus.NEGOTIATION, CollabStatus.AGREED, CollabStatus.PRODUCTION]);

            const c = await prisma.collab.create({
                data: {
                    userId: u.id,
                    brandId: brand.id,
                    product: `Produit ${brand.name} — ${1 + Math.floor(Math.random()*999)}`,
                    categoryId: cat.id,
                    isCompleted,
                    isPublic,
                    completedAt: isCompleted ? new Date(Date.now() - Math.floor(Math.random()*50)*86400000) : null,
                    contractSigned: Math.random() > 0.5,
                    negotiatedPrice: Math.random() > 0.3,
                    accessoriesNegotiated: Math.random() > 0.6,
                    accessoriesDetails: Math.random() > 0.6 ? 'Accessoires offerts' : null,
                    deliverables: { platforms: plat, items },
                    usagePaidMedia: Math.random() > 0.5,
                    usageDuration: Math.random() > 0.5 ? '6 mois' : null,
                    usageRegions: ['FR','EU','US'].filter(()=> Math.random() > 0.5),
                    exclusivityUntil: Math.random() > 0.7 ? new Date(Date.now() + 30*86400000) : null,
                    currency: 'EUR',
                    amount,
                    paid,
                    paidAt: paid ? new Date(Date.now() - 10*86400000) : null,
                    paymentMethod: paid ? rand(['virement','paypal']) : null,
                    paymentTerms: rand(['À réception','Net30','Net45','Net60']),
                    language: rand(['fr','en']),
                    country: rand(['FR','US','DE','ES']),
                    contactEmail: `pr@${brand.name.toLowerCase().replace(/[^a-z0-9]/g,'')}.com`,
                    contactPhone: '+442012345678',
                    status: final,
                    publicationLinks: isPublic ? ['https://instagram.com/p/demo','https://tiktok.com/@demo/video/123'].slice(0, 1 + Math.floor(Math.random()*2)) : [],
                    comment: rand(['Top collab','Feedback client ok','Deadline tenue','À améliorer']),
                    privateNotes: Math.random() > 0.6 ? 'Proposer upsell next quarter' : null,
                }
            });

            allCollabs.push(c);

            for (const t of pick(tags, 1 + Math.floor(Math.random()*3))) {
                await prisma.tagOnCollab.create({ data: { collabId: c.id, tagId: t.id } });
            }

            let prev: CollabStatus | null = null;
            for (let s = 0; s <= path.indexOf(c.status); s++) {
                const to = path[s];
                await prisma.pipelineEvent.create({
                    data: {
                        collabId: c.id,
                        from: prev,
                        to,
                        authorId: u.id,
                        note: rand([null,'OK','Devis envoyé','Produit reçu']),
                    }
                });
                prev = to;
            }
        }
    }

    // --- publicCount par user (dénormalisation) ---
    const byUser = await prisma.collab.groupBy({
        by: ['userId'],
        where: { isPublic: true },
        _count: { _all: true },
    });
    for (const row of byUser) {
        await prisma.user.update({ where: { id: row.userId }, data: { publicCount: row._count._all } });
    }

    // --- Invites de test ---
    await prisma.invite.upsert({
        where: { email: 'cohensteve@hotmail.fr' },
        update: { code: 'INVITE-STEVE', used: false, usedAt: null },
        create: { email: 'cohensteve@hotmail.fr', code: 'INVITE-STEVE' },
    });
    await prisma.invite.createMany({
        data: [
            { email: 'demo1@test.com', code: 'INVITE-1' },
            { email: 'demo2@test.com', code: 'INVITE-2' },
        ],
        skipDuplicates: true,
    });

    console.log('Seed done.');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
