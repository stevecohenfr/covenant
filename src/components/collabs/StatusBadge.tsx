import type { CollabStatus } from "@prisma/client";
import { statusLabel, statusTone } from "@/lib/status";


export function StatusBadge({ status }: { status: CollabStatus }) {
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusTone[status]}`}>{statusLabel[status]}</span>
    );
}
