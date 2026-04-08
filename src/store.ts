import { create } from 'zustand';
import type { Task } from './types';
import {
    loadTasks,
    saveTasks,
    loadTheme,
    saveTheme,
    loadTasksInRange,
    migrateFromLocalStorage,
} from './storage';
import { toDateKey, generateId } from './utils';

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

    // Init
    init: () => Promise<void>;

    // Task actions
    addTask: (text: string) => void;
    toggleTask: (id: string) => void;
    updateTask: (id: string, text: string) => void;
    deleteTask: (id: string) => void;
    reorderTasks: (activeId: string, overId: string) => void;
    clearCompleted: () => void;

    // Navigation
    setDate: (date: string) => void;

    // Theme
    toggleTheme: () => void;

    // Stats
    refreshWeeklyStats: () => Promise<void>;
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
    const records = await loadTasksInRange(start, end);

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

        init: async () => {
            await migrateFromLocalStorage();
            const tasks = await loadTasks(initialDate);
            const weeklyStats = await computeWeeklyStats();
            set({ tasks, ready: true, weeklyStats });
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
            saveTasks(currentDate, updated);
            set({ tasks: updated });
            get().refreshWeeklyStats();
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
            saveTasks(currentDate, updated);
            set({ tasks: updated });
            get().refreshWeeklyStats();
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
            saveTasks(currentDate, updated);
            set({ tasks: updated });
            get().refreshWeeklyStats();
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

        clearCompleted: () => {
            const { tasks, currentDate } = get();
            const updated = tasks.filter((t) => !t.completed);
            saveTasks(currentDate, updated);
            set({ tasks: updated });
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
    };
});
