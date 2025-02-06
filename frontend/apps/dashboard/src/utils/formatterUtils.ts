
import type { Dinero, UserResponse } from "@sudosos/sudosos-client";

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

export function formatDateFromString(date: string | undefined) {
    if (!date) return '';
    return date.split('T')[0];
}

export function fullName(user: UserResponse) {
    return user.lastName ? user.firstName + ' ' + user.lastName : user.firstName;
}

export function formatTimeSince(startDate: Date, now: Date) {
    const diff = now.getTime() - startDate.getTime();
    const diffInSeconds = Math.floor(diff / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 365) {
        return `${Math.floor(diffInDays / 365)} year(s) ago`;
    } else if (diffInDays > 0) {
        return `${diffInDays} days ago`;
    } else if (diffInHours > 0) {
        return `${diffInHours} hours ago`;
    } else if (diffInMinutes > 0) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInSeconds > 0) {
        return `${diffInSeconds} seconds ago`;
    } else {
        return 'just now';
    }
}