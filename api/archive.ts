import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { getUserFromRequest, cors } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const userId = user.userId;

    // GET /api/archive — load all archived tasks
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('archived_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('archived_at', { ascending: false });

        if (error) return res.status(500).json({ error: 'Failed to load archive' });

        const archivedTasks = (data ?? []).map((r) => ({
            id: r.id,
            date: r.date,
            text: r.text,
            createdAt: r.created_at,
            completedAt: r.completed_at,
            archivedAt: r.archived_at,
        }));

        return res.status(200).json({ archivedTasks });
    }

    // POST /api/archive — archive completed tasks { date, tasks[] }
    if (req.method === 'POST') {
        const { date, tasks } = req.body ?? {};
        if (!date || !Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({ error: 'date and tasks[] required' });
        }

        const now = new Date().toISOString();
        const rows = tasks.map((t: any) => ({
            id: t.id,
            user_id: userId,
            date,
            text: t.text,
            created_at: t.createdAt,
            completed_at: t.completedAt ?? now,
            archived_at: now,
        }));

        // Delete from tasks, insert into archived_tasks
        const ids = tasks.map((t: any) => t.id);
        await supabase.from('tasks').delete().in('id', ids).eq('user_id', userId);
        const { error } = await supabase.from('archived_tasks').insert(rows);
        if (error) return res.status(500).json({ error: 'Failed to archive' });

        return res.status(200).json({ ok: true });
    }

    // DELETE /api/archive?id=xxx — delete single archived task
    // DELETE /api/archive?all=true — clear all archived
    if (req.method === 'DELETE') {
        const id = req.query.id as string | undefined;
        const all = req.query.all as string | undefined;

        if (all === 'true') {
            await supabase.from('archived_tasks').delete().eq('user_id', userId);
            return res.status(200).json({ ok: true });
        }

        if (id) {
            await supabase.from('archived_tasks').delete().eq('id', id).eq('user_id', userId);
            return res.status(200).json({ ok: true });
        }

        return res.status(400).json({ error: 'id or all=true required' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
