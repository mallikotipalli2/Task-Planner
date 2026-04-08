import type { VercelRequest, VercelResponse } from '@vercel/node';
from '../lib/helpers.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const userId = user.userId;
    const start = req.query.start as string;
    const end = req.query.end as string;

    if (!start || !end) {
        return res.status(400).json({ error: 'start and end date params required' });
    }

    // Active tasks in range
    const { data: activeTasks } = await supabase
        .from('tasks')
        .select('date, completed')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end);

    // Archived tasks in range
    const { data: archivedTasks } = await supabase
        .from('archived_tasks')
        .select('date')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end);

    const records = [
        ...(activeTasks ?? []).map((r) => ({ date: r.date, completed: r.completed })),
        ...(archivedTasks ?? []).map((r) => ({ date: r.date, completed: true })),
    ];

    return res.status(200).json({ records });
}
