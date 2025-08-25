"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PublishButton({
                                  collabId,
                                  status,
                                  isPublic,
                              }: { collabId: string; status: string; isPublic: boolean }) {
    const router = useRouter();
    const [pending, start] = useTransition();

    if (status !== "CLOSED" || isPublic) return null;

    async function doPublish() {
        start(async () => {
            const r = await fetch(`/api/collabs/${collabId}/publish`, { method: "PATCH" });
            if (r.ok) router.refresh(); else alert("Erreur : impossible de publier.");
        });
    }

    return (
        <Button onClick={doPublish} disabled={pending} className="ml-2">
            {pending ? "Publication…" : "Publier"}
        </Button>
    );
}
