import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import NewCollabWizard from "./wizard";
import { revalidatePath } from "next/cache";


export default async function NewCollab(){
    await requireAuth();
    const [brands, tags] = await Promise.all([
        prisma.brand.findMany({ orderBy: { name: 'asc' } }),
        prisma.tag.findMany({ orderBy: { label: 'asc' } }),
    ]);
    return <NewCollabWizard brands={brands} tags={tags} createAction={create} />;
}


// src/app/collabs/new/page.tsx
async function create(data: any){
    'use server';
    const { getServerSession } = await import('next-auth');
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error('unauth');
    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!me) throw new Error('no user');

    const {
        tagIds = [],
        deliverablesItems = [],
        publicationLinks = [],
        brandId,
        brandName,
        categoryId,
        category,        // <- string libre éventuelle (ex: "test")
        ...rest
    } = data;

    // --- Brand (id ou nom) ---
    let finalBrandId: string | undefined = brandId;
    if (!finalBrandId && brandName?.trim()) {
        const b = await prisma.brand.upsert({
            where: { name: brandName.trim() },
            update: {},
            create: { name: brandName.trim() },
        });
        finalBrandId = b.id;
    }
    if (!finalBrandId) throw new Error('brand_required');

    // --- Category (id OU nom libre) ---
    let finalCategoryId: string | undefined = categoryId;
    if (!finalCategoryId && typeof category === 'string' && category.trim()) {
        const c = await prisma.category.upsert({
            where: { name: category.trim() },
            update: {},
            create: { name: category.trim() },
        });
        finalCategoryId = c.id;
    }

    // --- Create collab ---
    const collab = await prisma.collab.create({
        data: {
            userId: me.id,
            brandId: finalBrandId,
            product: rest.product,
            categoryId: finalCategoryId ?? null,     // <- IMPORTANT
            language: rest.language || null,
            country: rest.country || null,

            contractSigned: !!rest.contractSigned,
            negotiatedPrice: !!rest.negotiatedPrice,
            accessoriesNegotiated: !!rest.accessoriesNegotiated,
            accessoriesDetails: rest.accessoriesDetails || null,

            usagePaidMedia: rest.usagePaidMedia ?? null,
            usageDuration: rest.usageDuration || null,
            usageRegions: Array.isArray(rest.usageRegions) ? rest.usageRegions : [],
            exclusivityUntil: rest.exclusivityUntil ? new Date(rest.exclusivityUntil) : null,

            currency: rest.currency || 'EUR',
            amount: rest.amount ? Number(rest.amount) * 100 : null,
            paid: !!rest.paid,
            paidAt: rest.paidAt ? new Date(rest.paidAt) : null,
            paymentMethod: rest.paymentMethod || null,
            paymentTerms: rest.paymentTerms || null,

            contactEmail: rest.contactEmail || null,
            contactPhone: rest.contactPhone || null,

            // on accepte des items [{platform,type,count}] → ok en JSON
            deliverables: { items: deliverablesItems },

            publicationLinks,
            comment: rest.comment || null,
            privateNotes: rest.privateNotes || null,

            isCompleted: !!rest.isCompleted,
            isPublic: !!rest.isPublic && !!rest.isCompleted, // pas public si non terminé
            status: rest.isCompleted ? 'CLOSED' : (rest.status || 'PROSPECTION'),

            // tags N-N
            tags: { create: (tagIds as string[]).map(id => ({ tagId: id })) },
        },
    });

    // maj compteur public si nécessaire
    if (collab.isPublic) {
        await prisma.user.update({
            where: { id: me.id },
            data: { publicCount: { increment: 1 } },
        });
    }

    revalidatePath('/');
    revalidatePath('/collabs');
}
