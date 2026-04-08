import type { VercelRequest, VercelResponse } from '@vercel/node';
from '../../lib/helpers.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const user = getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    return res.status(200).json({ user });
}
