import Dexie, { type Table } from 'dexie';

export interface TaskRecord {
    id: string;
    date: string;        // YYYY-MM-DD
    text: string;
    completed: boolean;
    createdAt: string;   // ISO string
    completedAt?: string; // ISO string
    order: number;
}

export interface ArchivedTaskRecord {
    id: string;
    date: string;        // YYYY-MM-DD (original task date)
    text: string;
    createdAt: string;   // ISO string
    completedAt: string; // ISO string
    archivedAt: string;  // ISO string
}

class TaskPlannerDB extends Dexie {
    tasks!: Table<TaskRecord, string>;
    archivedTasks!: Table<ArchivedTaskRecord, string>;

    constructor() {
        super('TaskPlannerDB');

        this.version(1).stores({
            tasks: 'id, date, order',
        });

        this.version(2).stores({
            tasks: 'id, date, order',
            archivedTasks: 'id, date, archivedAt',
        });
    }
}

export const db = new TaskPlannerDB();
