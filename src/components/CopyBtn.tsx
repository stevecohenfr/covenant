"use client";

export function CopyBtn({ text }: { text: string }) {
    return (
        <button
            onClick={() => navigator.clipboard.writeText(text)}
            className="text-sm underline"
            title="Copier le code"
        >
            Copier
        </button>
    );
}
