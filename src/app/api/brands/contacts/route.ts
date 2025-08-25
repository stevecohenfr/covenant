import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest){
    const brandId = req.nextUrl.searchParams.get('brandId');
    if (!brandId) return NextResponse.json([]);
    const rows = await prisma.contact.findMany({
        where: { brandId },
        orderBy: { language: 'asc' },
        select: { id:true, email:true, phone:true, language:true, role:true }
    });
    return NextResponse.json(rows);
}
