"use client";
import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusLabel } from "@/lib/status";
import type { CollabStatus } from "@prisma/client";


export function StatusSelect({ collabId, value, onChanged }: { collabId: string; value: CollabStatus; onChanged?: (v: CollabStatus)=>void }) {
    const [pending, setPending] = React.useState(false);
    return (
        <Select defaultValue={value} onValueChange={async (v)=>{
            setPending(true);
            const r = await fetch(`/api/collabs/${collabId}/status`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ to: v })});
            setPending(false);
            if (r.ok) onChanged?.(v as CollabStatus);
        }}>
            <SelectTrigger className="w-[220px]" disabled={pending}>
                <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
                {(Object.keys(statusLabel) as CollabStatus[]).map(s => (
                    <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
