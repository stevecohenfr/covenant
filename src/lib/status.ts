import type { CollabStatus } from "@prisma/client";


export const statusLabel: Record<CollabStatus, string> = {
    PROSPECTION: "Prospection",
    WAITING_REPLY: "Attente réponse",
    NEGOTIATION: "Négociation",
    AGREED: "Accord conclu",
    WAITING_PRODUCT: "Attente produit",
    PRODUCTION: "Production",
    IN_REVIEW: "En review",
    PUBLISHED: "Publié",
    INVOICED: "Facturé",
    WAITING_PAYMENT: "Paiement en attente",
    PAID: "Payé",
    CLOSED: "Clôturée",
};


export const statusTone: Record<CollabStatus, string> = {
    PROSPECTION: "bg-gray-100 text-gray-700",
    WAITING_REPLY: "bg-yellow-100 text-yellow-800",
    NEGOTIATION: "bg-purple-100 text-purple-800",
    AGREED: "bg-blue-100 text-blue-800",
    WAITING_PRODUCT: "bg-amber-100 text-amber-800",
    PRODUCTION: "bg-indigo-100 text-indigo-800",
    IN_REVIEW: "bg-sky-100 text-sky-800",
    PUBLISHED: "bg-green-100 text-green-800",
    INVOICED: "bg-orange-100 text-orange-800",
    WAITING_PAYMENT: "bg-rose-100 text-rose-800",
    PAID: "bg-emerald-100 text-emerald-800",
    CLOSED: "bg-gray-200 text-gray-700",
};
