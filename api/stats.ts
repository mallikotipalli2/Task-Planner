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
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const userId = user.userId;
    const start = req.query.start as string;
    const end = req.query.end as string;
    if (!start || !end) return res.status(400).json({ error: 'start and end date params required' });

    const { data: activeTasks } = await supabase
        .from('tasks').select('date, completed')
        .eq('user_id', userId).gte('date', start).lte('date', end);

    const { data: archivedTasks } = await supabase
        .from('archived_tasks').select('date')
        .eq('user_id', userId).gte('date', start).lte('date', end);

    const records = [
        ...(activeTasks ?? []).map((r) => ({ date: r.date, completed: r.completed })),
        ...(archivedTasks ?? []).map((r) => ({ date: r.date, completed: true })),
    ];
    return res.status(200).json({ records });
}
