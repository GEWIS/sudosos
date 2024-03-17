import type { Dinero } from "@sudosos/sudosos-client";

export function formatDateTime(date: Date): string {

    const daysOfWeek: Array<string> = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const day = parseTime(date.getDate());
    const monthIndex = parseTime(date.getMonth() + 1);
    const year = date.getFullYear().toString();
    const dayOfWeek = daysOfWeek[date.getDay()];
    return `${day}-${monthIndex}-${year} (${dayOfWeek})`;
}

function parseTime(value: number): string {
    return value.toString().padStart(2, '0');
}

export function formatPrice(value: Dinero, isNegative?: boolean): string {
    if(isNegative) {
        return ((value.amount / 100)*-1).toLocaleString('nl-NL', { style: 'currency', currency: "EUR" });
    } else {
        return (value.amount / 100).toLocaleString('nl-NL', { style: 'currency', currency: "EUR" });
    }

}
