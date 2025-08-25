"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl: "/",
        });
        setLoading(false);
        if (res?.error) setError("Identifiants invalides");
        else if (res?.ok && res.url) window.location.href = res.url!;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-xl rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        Connexion
                    </CardTitle>
                    <CardDescription className="text-center">
                        Connecte-toi pour accéder à tes collaborations
                    </CardDescription>
                </CardHeader>
                <form onSubmit={onSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded-md text-center">
                                {error}
                            </div>
                        )}
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 mt-4">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Connexion…" : "Entrer"}
                        </Button>
                        <Link
                            href="/invite"
                            className="text-sm text-center text-gray-500 hover:text-gray-700"
                        >
                            J’ai une invitation
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
