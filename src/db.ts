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

class TaskPlannerDB extends Dexie {
    tasks!: Table<TaskRecord, string>;

    constructor() {
        super('TaskPlannerDB');
        this.version(1).stores({
            tasks: 'id, date, order',
        });
    }
}

export const db = new TaskPlannerDB();
