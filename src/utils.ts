/**
 * Formats a Date to YYYY-MM-DD string using local time.
 */
export function toDateKey(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Returns a human-friendly label for a date key.
 */
export function formatDateLabel(dateKey: string): string {
    const today = toDateKey();
    if (dateKey === today) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateKey === toDateKey(yesterday)) return 'Yesterday';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateKey === toDateKey(tomorrow)) return 'Tomorrow';

    const date = new Date(dateKey + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Formats a YYYY-MM-DD date key to DD-MM-YYYY.
 */
export function formatDateDDMMYYYY(dateKey: string): string {
    const [y, m, d] = dateKey.split('-');
    return `${d}-${m}-${y}`;
}

/**
 * Generate a unique ID.
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
