import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';


export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAuthPage = req.nextUrl.pathname.startsWith('/login');
    if (!token && !isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}


export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/auth|api/public|api/invit|login|invite|register|/og.jpg|/favicon*|/site.webmanifest|/robots.txt).*)',
    ],
};

