import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
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
    try {
        cors(res);
        if (req.method === 'OPTIONS') return res.status(204).end();
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

        const user = getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Not authenticated' });

        const { currentPassword, newPassword } = req.body ?? {};

        if (!currentPassword || typeof currentPassword !== 'string') {
            return res.status(400).json({ error: 'Current password is required' });
        }
        if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4 || newPassword.length > 64) {
            return res.status(400).json({ error: 'New password must be 4-64 characters' });
        }

        const { data: dbUser, error: fetchError } = await supabase
            .from('users')
            .select('id, password_hash')
            .eq('id', user.userId)
            .single();

        if (fetchError || !dbUser) return res.status(404).json({ error: 'User not found' });

        const valid = await bcrypt.compare(currentPassword, dbUser.password_hash);
        if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

        const newHash = await bcrypt.hash(newPassword, 10);

        const { error: updateError } = await supabase
            .from('users')
            .update({ password_hash: newHash })
            .eq('id', user.userId);

        if (updateError) return res.status(500).json({ error: 'Failed to update password' });

        return res.status(200).json({ ok: true });
    } catch (err: any) {
        return res.status(500).json({ error: 'Internal server error', detail: err?.message });
    }
}
