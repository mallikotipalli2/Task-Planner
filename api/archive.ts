import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function cors(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function getUserFromRequest(req: VercelRequest) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return null;
    try {
        const p = jwt.verify(header.slice(7), JWT_SECRET) as any;
        return { userId: p.userId as string, username: p.username as string };
    } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const userId = user.userId;

    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('archived_tasks').select('*').eq('user_id', userId)
            .order('archived_at', { ascending: false });

        if (error) return res.status(500).json({ error: 'Failed to load archive' });

        const archivedTasks = (data ?? []).map((r) => ({
            id: r.id, date: r.date, text: r.text,
            createdAt: r.created_at, completedAt: r.completed_at, archivedAt: r.archived_at,
        }));
        return res.status(200).json({ archivedTasks });
    }

    if (req.method === 'POST') {
        const { date, tasks } = req.body ?? {};
        if (!date || !Array.isArray(tasks) || tasks.length === 0)
            return res.status(400).json({ error: 'date and tasks[] required' });

        const now = new Date().toISOString();
        const rows = tasks.map((t: any) => ({
            id: t.id, user_id: userId, date, text: t.text,
            created_at: t.createdAt, completed_at: t.completedAt ?? now, archived_at: now,
        }));

        const ids = tasks.map((t: any) => t.id);
        await supabase.from('tasks').delete().in('id', ids).eq('user_id', userId);
        const { error } = await supabase.from('archived_tasks').insert(rows);
        if (error) return res.status(500).json({ error: 'Failed to archive' });
        return res.status(200).json({ ok: true });
    }

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
