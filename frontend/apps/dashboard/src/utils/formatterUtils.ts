import type { Dinero, UserResponse } from "@sudosos/sudosos-client";
import i18n from '@/utils/i18nUtils';

const t = i18n.global.t;

export function formatDateTime(date: Date): string {

    const daysOfWeek: Array<string> = [
        t('common.time.sunday'),
        t('common.time.monday'),
        t('common.time.tuesday'),
        t('common.time.wednesday'),
        t('common.time.thursday'),
        t('common.time.friday'),
        t('common.time.saturday'),
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
        return Math.floor(diffInDays / 365) + t('common.time.yearsAgo');
    } else if (diffInDays > 0) {
        return diffInDays + t('common.time.daysAgo');
    } else if (diffInHours > 0) {
        return diffInHours + t('common.time.hoursAgo');
    } else if (diffInMinutes > 0) {
        return diffInMinutes + t('common.time.minutesAgo');
    } else if (diffInSeconds > 0) {
        return diffInSeconds + t('common.time.secondsAgo');
    } else {
        return t('common.time.justNow');
    }
}

export function formatFineTimeSince(startDate: Date, now: Date) {
    const diff = now.getTime() - startDate.getTime();
    const diffInDays = Math.floor(diff / (24 * 60*60*1000));


    if (diff <= 0) {
        return "";
    } else if (diffInDays == 0) {
        return t('common.time.today');
    } else if (diffInDays == 1) {
        return t('common.time.yesterday');
    } else {
        return diffInDays + t('common.time.daysAgo');
    }
}