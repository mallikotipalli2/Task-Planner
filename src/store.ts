import { create } from 'zustand';
import type { Task } from './types';
import { loadTasks, saveTasks, loadTheme, saveTheme } from './storage';
import { toDateKey, generateId } from './utils';

interface TaskStore {
    // State
    currentDate: string;
    tasks: Task[];
    theme: 'light' | 'dark';

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
}

function getInitialTheme(): 'light' | 'dark' {
    const saved = loadTheme();
    if (saved) return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

export const useTaskStore = create<TaskStore>((set, get) => {
    const initialDate = toDateKey();
    const initialTasks = loadTasks(initialDate);
    const initialTheme = getInitialTheme();

    return {
        currentDate: initialDate,
        tasks: initialTasks,
        theme: initialTheme,

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
        },

        setDate: (date: string) => {
            const tasks = loadTasks(date);
            set({ currentDate: date, tasks });
        },

        toggleTheme: () => {
            const next = get().theme === 'light' ? 'dark' : 'light';
            saveTheme(next);
            set({ theme: next });
        },
    };
});
