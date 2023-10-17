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
    const monthIndex = parseTime(date.getMonth());
    const year = date.getFullYear().toString();
    const dayOfWeek = daysOfWeek[date.getDay()];
    return `${day}-${monthIndex}-${year} (${dayOfWeek})`;
}

function parseTime(value: number): string {
    return value.toString().padStart(2, '0');
}

export function formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('en', { style: 'currency', currency: 'EUR' });
}
