import { create } from 'zustand';
import type { Task } from './types';
import type { ArchivedTaskRecord } from './db';
import {
    loadTasks as localLoadTasks,
    saveTasks as localSaveTasks,
    loadTheme,
    saveTheme,
    loadAllTasksInRange as localLoadAllTasksInRange,
    archiveCompletedTasks as localArchiveCompleted,
    loadArchivedTasks as localLoadArchivedTasks,
    deleteArchivedTask as localDeleteArchivedTask,
    clearAllArchived as localClearAllArchived,
    migrateFromLocalStorage,
} from './storage';
import {
    cloudLoadTasks,
    cloudSaveTasks,
    cloudLoadAllTasksInRange,
    cloudArchiveCompleted,
    cloudLoadArchivedTasks,
    cloudDeleteArchivedTask,
    cloudClearAllArchived,
    type CloudArchivedTask,
} from './cloudStorage';
import { toDateKey, generateId } from './utils';

function isAuthenticated(): boolean {
    return !!localStorage.getItem('taskplanner:token');
}

// Unified storage functions that route to local or cloud
async function loadTasks(dateKey: string): Promise<Task[]> {
    if (isAuthenticated()) return cloudLoadTasks(dateKey);
    return localLoadTasks(dateKey);
}

async function saveTasks(dateKey: string, tasks: Task[]): Promise<void> {
    if (isAuthenticated()) return cloudSaveTasks(dateKey, tasks);
    return localSaveTasks(dateKey, tasks);
}

async function loadAllTasksInRange(start: string, end: string) {
    if (isAuthenticated()) return cloudLoadAllTasksInRange(start, end);
    return localLoadAllTasksInRange(start, end);
}

async function archiveCompletedTasks(dateKey: string, tasks: Task[]) {
    if (isAuthenticated()) return cloudArchiveCompleted(dateKey, tasks);
    return localArchiveCompleted(dateKey, tasks);
}

async function loadArchivedTasks(): Promise<(ArchivedTaskRecord | CloudArchivedTask)[]> {
    if (isAuthenticated()) return cloudLoadArchivedTasks();
    return localLoadArchivedTasks();
}

async function deleteArchivedTask(id: string) {
    if (isAuthenticated()) return cloudDeleteArchivedTask(id);
    return localDeleteArchivedTask(id);
}

async function clearAllArchived() {
    if (isAuthenticated()) return cloudClearAllArchived();
    return localClearAllArchived();
}

export interface DayStat {
    date: string;
    total: number;
    completed: number;
}

interface TaskStore {
    // State
    currentDate: string;
    tasks: Task[];
    theme: 'light' | 'dark';
    ready: boolean;
    weeklyStats: DayStat[];

    // Archive state
    showArchive: boolean;
    archivedTasks: (ArchivedTaskRecord | CloudArchivedTask)[];

    // Init
    init: () => Promise<void>;

    // Task actions
    addTask: (text: string) => void;
    toggleTask: (id: string) => void;
    updateTask: (id: string, text: string) => void;
    deleteTask: (id: string) => void;
    reorderTasks: (activeId: string, overId: string) => void;
    archiveCompleted: () => void;

    // Archive actions
    toggleArchiveView: () => void;
    loadArchive: () => Promise<void>;
    deleteArchivedItem: (id: string) => Promise<void>;
    clearArchive: () => Promise<void>;

    // Navigation
    setDate: (date: string) => void;

    // Theme
    toggleTheme: () => void;

    // Stats
    refreshWeeklyStats: () => Promise<void>;

    // Sync (re-fetch current date tasks + archive from server)
    sync: () => Promise<void>;
}

function getInitialTheme(): 'light' | 'dark' {
    const saved = loadTheme();
    if (saved) return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

function getWeekRange(): { start: string; end: string } {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return { start: toDateKey(start), end: toDateKey(today) };
}

async function computeWeeklyStats(): Promise<DayStat[]> {
    const { start, end } = getWeekRange();
    const records = await loadAllTasksInRange(start, end);

    const map = new Map<string, { total: number; completed: number }>();
    // Pre-populate all 7 days
    const d = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');
    while (d <= endDate) {
        map.set(toDateKey(d), { total: 0, completed: 0 });
        d.setDate(d.getDate() + 1);
    }
    for (const r of records) {
        const entry = map.get(r.date) ?? { total: 0, completed: 0 };
        entry.total++;
        if (r.completed) entry.completed++;
        map.set(r.date, entry);
    }
    return Array.from(map.entries()).map(([date, stat]) => ({
        date,
        ...stat,
    }));
}

export const useTaskStore = create<TaskStore>((set, get) => {
    const initialDate = toDateKey();
    const initialTheme = getInitialTheme();

    return {
        currentDate: initialDate,
        tasks: [],
        theme: initialTheme,
        ready: false,
        weeklyStats: [],
        showArchive: false,
        archivedTasks: [],

        init: async () => {
            if (!isAuthenticated()) {
                await migrateFromLocalStorage();
            }
            const tasks = await loadTasks(initialDate);
            const weeklyStats = await computeWeeklyStats();
            const archivedTasks = await loadArchivedTasks();
            set({ tasks, ready: true, weeklyStats, archivedTasks });
        },

        addTask: (text: string) => {
            const trimmed = text.trim();
            if (!trimmed) return;

            const { tasks, currentDate } = get();
            const maxOrder = tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) : -1;

            const newTask: Task = {
                id: generateId(),
                text: trimmed,
                completed: false,
                createdAt: new Date().toISOString(),
                order: maxOrder + 1,
            };

            const updated = [...tasks, newTask];
            set({ tasks: updated });
            saveTasks(currentDate, updated).then(() => get().refreshWeeklyStats());
        },

        toggleTask: (id: string) => {
            const { tasks, currentDate } = get();
            const updated = tasks.map((t) =>
                t.id === id
                    ? {
                        ...t,
                        completed: !t.completed,
                        completedAt: !t.completed ? new Date().toISOString() : undefined,
                    }
                    : t
            );
            set({ tasks: updated });
            saveTasks(currentDate, updated).then(() => get().refreshWeeklyStats());
        },

        updateTask: (id: string, text: string) => {
            const trimmed = text.trim();
            if (!trimmed) return;

            const { tasks, currentDate } = get();
            const updated = tasks.map((t) => (t.id === id ? { ...t, text: trimmed } : t));
            saveTasks(currentDate, updated);
            set({ tasks: updated });
        },

        deleteTask: (id: string) => {
            const { tasks, currentDate } = get();
            const updated = tasks.filter((t) => t.id !== id);
            set({ tasks: updated });
            saveTasks(currentDate, updated).then(() => get().refreshWeeklyStats());
        },

        reorderTasks: (activeId: string, overId: string) => {
            const { tasks, currentDate } = get();
            const oldIndex = tasks.findIndex((t) => t.id === activeId);
            const newIndex = tasks.findIndex((t) => t.id === overId);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = [...tasks];
            const [moved] = reordered.splice(oldIndex, 1);
            reordered.splice(newIndex, 0, moved);

            const updated = reordered.map((t, i) => ({ ...t, order: i }));
            saveTasks(currentDate, updated);
            set({ tasks: updated });
        },

        archiveCompleted: () => {
            const { tasks, currentDate } = get();
            const completed = tasks.filter((t) => t.completed);
            if (completed.length === 0) return;
            const remaining = tasks.filter((t) => !t.completed);
            set({ tasks: remaining });
            Promise.all([
                archiveCompletedTasks(currentDate, completed),
                saveTasks(currentDate, remaining),
            ]).then(async () => {
                const archivedTasks = await loadArchivedTasks();
                set({ archivedTasks });
                get().refreshWeeklyStats();
            });
        },

        toggleArchiveView: () => {
            const next = !get().showArchive;
            set({ showArchive: next });
            if (next) get().loadArchive();
        },

        loadArchive: async () => {
            const archivedTasks = await loadArchivedTasks();
            set({ archivedTasks });
        },

        deleteArchivedItem: async (id: string) => {
            await deleteArchivedTask(id);
            const archivedTasks = get().archivedTasks.filter((t) => t.id !== id);
            set({ archivedTasks });
            get().refreshWeeklyStats();
        },

        clearArchive: async () => {
            await clearAllArchived();
            set({ archivedTasks: [] });
            get().refreshWeeklyStats();
        },

        setDate: async (date: string) => {
            const tasks = await loadTasks(date);
            set({ currentDate: date, tasks });
        },

        toggleTheme: () => {
            const next = get().theme === 'light' ? 'dark' : 'light';
            saveTheme(next);
            set({ theme: next });
        },

        refreshWeeklyStats: async () => {
            const weeklyStats = await computeWeeklyStats();
            set({ weeklyStats });
        },

        sync: async () => {
            const { currentDate } = get();
            const [tasks, archivedTasks, weeklyStats] = await Promise.all([
                loadTasks(currentDate),
                loadArchivedTasks(),
                computeWeeklyStats(),
            ]);
            set({ tasks, archivedTasks, weeklyStats });
        },
    };
});
