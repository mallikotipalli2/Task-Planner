import type { Task } from './types';
import { db, type TaskRecord } from './db';

const STORAGE_PREFIX = 'taskplanner';
const THEME_KEY = `${STORAGE_PREFIX}:theme`;
const MIGRATED_KEY = `${STORAGE_PREFIX}:migrated`;

/* ── helpers: convert between store Task and DB TaskRecord ── */

function toRecord(task: Task, date: string): TaskRecord {
    return { ...task, date };
}

function toTask(record: TaskRecord): Task {
    const { date: _date, ...rest } = record;
    return rest;
}

/* ── localStorage → IndexedDB one-time migration ── */

export async function migrateFromLocalStorage(): Promise<void> {
    try {
        if (localStorage.getItem(MIGRATED_KEY)) return;

        const keys = Object.keys(localStorage).filter((k) =>
            k.startsWith(`${STORAGE_PREFIX}:tasks:`)
        );

        for (const key of keys) {
            const dateKey = key.replace(`${STORAGE_PREFIX}:tasks:`, '');
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            try {
                const tasks: Task[] = JSON.parse(raw);
                if (!Array.isArray(tasks)) continue;
                const records = tasks.map((t) => toRecord(t, dateKey));
                await db.tasks.bulkPut(records);
                localStorage.removeItem(key);
            } catch {
                // skip corrupt entries
            }
        }

        localStorage.setItem(MIGRATED_KEY, '1');
    } catch {
        // migration is best-effort
    }
}

/* ── Task CRUD (async, IndexedDB-backed) ── */

/**
 * Load tasks for a given date key.
 */
export async function loadTasks(dateKey: string): Promise<Task[]> {
    try {
        const records = await db.tasks
            .where('date')
            .equals(dateKey)
            .sortBy('order');
        return records.map(toTask);
    } catch {
        return [];
    }
}

/**
 * Save tasks for a given date key (full replace).
 */
export async function saveTasks(dateKey: string, tasks: Task[]): Promise<void> {
    try {
        await db.transaction('rw', db.tasks, async () => {
            await db.tasks.where('date').equals(dateKey).delete();
            await db.tasks.bulkAdd(tasks.map((t) => toRecord(t, dateKey)));
        });
    } catch {
        console.warn('Failed to save tasks to IndexedDB');
    }
}

/**
 * Load tasks for a date range (inclusive). Used by charts.
 */
export async function loadTasksInRange(
    startDate: string,
    endDate: string
): Promise<TaskRecord[]> {
    try {
        return await db.tasks
            .where('date')
            .between(startDate, endDate, true, true)
            .toArray();
    } catch {
        return [];
    }
}

/* ── Theme (stays in localStorage — tiny, sync-safe) ── */

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
