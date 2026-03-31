import type { Task } from './types';

const STORAGE_PREFIX = 'taskplanner';
const TASKS_KEY = (date: string) => `${STORAGE_PREFIX}:tasks:${date}`;
const THEME_KEY = `${STORAGE_PREFIX}:theme`;

/**
 * Load tasks for a given date key.
 */
export function loadTasks(dateKey: string): Task[] {
    try {
        const raw = localStorage.getItem(TASKS_KEY(dateKey));
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed as Task[];
    } catch {
        return [];
    }
}

/**
 * Save tasks for a given date key.
 */
export function saveTasks(dateKey: string, tasks: Task[]): void {
    try {
        localStorage.setItem(TASKS_KEY(dateKey), JSON.stringify(tasks));
    } catch {
        console.warn('Failed to save tasks to localStorage');
    }
}

/**
 * Load saved theme preference.
 */
export function loadTheme(): 'light' | 'dark' | null {
    try {
        const val = localStorage.getItem(THEME_KEY);
        if (val === 'light' || val === 'dark') return val;
        return null;
    } catch {
        return null;
    }
}

/**
 * Save theme preference.
 */
export function saveTheme(theme: 'light' | 'dark'): void {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        // silent
    }
}
