'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function LogoutPage() {
    useEffect(() => {
        // redirige vers /login après la déconnexion
        signOut({ callbackUrl: '/login' });
    }, []);

    return <p>Déconnexion…</p>;
}
