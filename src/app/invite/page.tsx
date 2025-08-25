"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InvitePage() {
    const [step, setStep] = useState<"code" | "register">("code");
    const [code, setCode] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function verifyCode(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        const r = await fetch("/api/invite/verify", {
            method: "POST",
            body: JSON.stringify({ code }),
            headers: { "Content-Type": "application/json" },
        });
        const j = await r.json();
        setLoading(false);
        if (!j.ok) setMsg("Code invalide ou déjà utilisé");
        else {
            setEmail(j.email ?? "");
            setStep("register");
        }
    }

    async function register(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        const r = await fetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ code, email, password }),
            headers: { "Content-Type": "application/json" },
        });
        const j = await r.json();
        setLoading(false);

        if (!j.ok) {
            setMsg("Impossible de créer le compte");
        } else {
            // 🚀 login auto
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl: "/",
            });
            if (res?.error) {
                setMsg("Compte créé, mais connexion impossible. Essaie manuellement sur /login.");
            } else if (res?.ok && res.url) {
                window.location.href = res.url;
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            {step === "code" && (
                <Card className="w-full max-w-md shadow-xl rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">
                            J’ai une invitation
                        </CardTitle>
                        <CardDescription className="text-center">
                            Entrez votre code pour créer votre compte
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={verifyCode}>
                        <CardContent className="space-y-4">
                            {msg && (
                                <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded-md text-center">
                                    {msg}
                                </div>
                            )}
                            <Input
                                placeholder="Code d’invitation"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 mt-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Vérification…" : "Continuer"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            {step === "register" && (
                <Card className="w-full max-w-md shadow-xl rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">
                            Créer mon compte
                        </CardTitle>
                        <CardDescription className="text-center">
                            Finalisez votre inscription
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={register}>
                        <CardContent className="space-y-4 mt-4">
                            {msg && (
                                <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded-md text-center">
                                    {msg}
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
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Création…" : "Créer le compte"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}
        </div>
    );
}
