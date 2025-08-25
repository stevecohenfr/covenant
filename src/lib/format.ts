export function moneyCentsToStr(cents?: number|null, currency: string = "EUR") {
    if (cents == null) return "Gift / N.C.";
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}
