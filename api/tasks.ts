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
        const date = req.query.date as string;
        if (!date) return res.status(400).json({ error: 'date query param required' });

        const { data, error } = await supabase
            .from('tasks')
            .select('id, date, text, completed, created_at, completed_at, sort_order')
            .eq('user_id', userId).eq('date', date)
            .order('sort_order', { ascending: true });

        if (error) return res.status(500).json({ error: 'Failed to load tasks' });

        const tasks = (data ?? []).map((r) => ({
            id: r.id, text: r.text, completed: r.completed,
            createdAt: r.created_at, completedAt: r.completed_at ?? undefined, order: r.sort_order,
        }));
        return res.status(200).json({ tasks });
    }

    if (req.method === 'PUT') {
        const { date, tasks } = req.body ?? {};
        if (!date || !Array.isArray(tasks)) return res.status(400).json({ error: 'date and tasks[] required' });

        await supabase.from('tasks').delete().eq('user_id', userId).eq('date', date);

        if (tasks.length > 0) {
            const rows = tasks.map((t: any) => ({
                id: t.id, user_id: userId, date, text: t.text, completed: t.completed,
                created_at: t.createdAt, completed_at: t.completedAt ?? null, sort_order: t.order,
            }));
            const { error } = await supabase.from('tasks').insert(rows);
            if (error) return res.status(500).json({ error: 'Failed to save tasks' });
        }
        return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
