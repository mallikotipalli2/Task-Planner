export interface Task {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;   // ISO date string
    completedAt?: string; // ISO date string
    order: number;
}

export interface DayData {
    date: string;   // YYYY-MM-DD
    tasks: Task[];
}

export type ThemeMode = 'light' | 'dark' | 'system';
