import { cn } from "@/lib/utils";

export function VisibilityBadge({ isPublic }: { isPublic: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                isPublic
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
            )}
        >
      {isPublic ? "Publique" : "Privée"}
    </span>
    );
}
