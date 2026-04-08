import type { Task } from './types';

const API_BASE = '/api';

function getToken(): string | null {
    return localStorage.getItem('taskplanner:token');
}

function authHeaders(): HeadersInit {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: { ...authHeaders(), ...init?.headers },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `API error ${res.status}`);
    }
    return res.json();
}

/* ── Auth ── */

export interface AuthUser {
    id: string;
    username: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export async function apiRegister(username: string, password: string): Promise<AuthResponse> {
    return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

export async function apiLogin(username: string, password: string): Promise<AuthResponse> {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

export async function apiGetMe(): Promise<{ user: AuthUser }> {
    return apiFetch('/auth/me');
}

/* ── Tasks ── */

export async function cloudLoadTasks(dateKey: string): Promise<Task[]> {
    const { tasks } = await apiFetch<{ tasks: Task[] }>(`/tasks?date=${dateKey}`);
    return tasks;
}

export async function cloudSaveTasks(dateKey: string, tasks: Task[]): Promise<void> {
    await apiFetch('/tasks', {
        method: 'PUT',
        body: JSON.stringify({ date: dateKey, tasks }),
    });
}

/* ── Archive ── */

export interface CloudArchivedTask {
    id: string;
    date: string;
    text: string;
    createdAt: string;
    completedAt: string;
    archivedAt: string;
}

export async function cloudLoadArchivedTasks(): Promise<CloudArchivedTask[]> {
    const { archivedTasks } = await apiFetch<{ archivedTasks: CloudArchivedTask[] }>('/archive');
    return archivedTasks;
}

export async function cloudArchiveCompleted(dateKey: string, tasks: Task[]): Promise<void> {
    await apiFetch('/archive', {
        method: 'POST',
        body: JSON.stringify({ date: dateKey, tasks }),
    });
}

export async function cloudDeleteArchivedTask(id: string): Promise<void> {
    await apiFetch(`/archive?id=${id}`, { method: 'DELETE' });
}

export async function cloudClearAllArchived(): Promise<void> {
    await apiFetch('/archive?all=true', { method: 'DELETE' });
}

/* ── Stats ── */

export async function cloudLoadAllTasksInRange(
    start: string,
    end: string
): Promise<{ date: string; completed: boolean }[]> {
    const { records } = await apiFetch<{ records: { date: string; completed: boolean }[] }>(
        `/stats?start=${start}&end=${end}`
    );
    return records;
}
