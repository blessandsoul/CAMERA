export const formatCurrency = (amount: number, currency = 'GEL'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (date: string | Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
};

export const formatRelativeTime = (date: string | Date): string => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = (then.getTime() - now.getTime()) / 1000;

    const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
        { unit: 'year', seconds: 31536000 },
        { unit: 'month', seconds: 2592000 },
        { unit: 'day', seconds: 86400 },
        { unit: 'hour', seconds: 3600 },
        { unit: 'minute', seconds: 60 },
    ];

    for (const { unit, seconds } of units) {
        if (Math.abs(diffInSeconds) >= seconds) {
            return rtf.format(Math.round(diffInSeconds / seconds), unit);
        }
    }
    return rtf.format(Math.round(diffInSeconds), 'second');
};

export const truncate = (str: string, length: number): string => {
    return str.length > length ? `${str.substring(0, length)}...` : str;
};

/** Formats a Georgian phone number: "597470518" → "597 47 05 18" */
export const formatPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 9) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
    }
    return phone;
};
