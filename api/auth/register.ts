import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, hashPassword, signToken, cors } from '../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        cors(res);
        if (req.method === 'OPTIONS') return res.status(204).end();
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

        const { username, password } = req.body ?? {};

        if (!username || typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 20) {
            return res.status(400).json({ error: 'Username must be 3-20 characters' });
        }
        if (!password || typeof password !== 'string' || password.length < 4 || password.length > 64) {
            return res.status(400).json({ error: 'Password must be 4-64 characters' });
        }

        const cleanUsername = username.trim().toLowerCase();

        // Check if username exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('username', cleanUsername)
            .single();

        if (existing) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        const passwordHash = await hashPassword(password);

        const { data: user, error } = await supabase
            .from('users')
            .insert({ username: cleanUsername, password_hash: passwordHash })
            .select('id, username, created_at')
            .single();

        if (error || !user) {
            return res.status(500).json({ error: 'Failed to create account', detail: error?.message });
        }

        const token = signToken({ userId: user.id, username: user.username });

        return res.status(201).json({
            token,
            user: { id: user.id, username: user.username },
        });
    } catch (err: any) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Internal server error', detail: err?.message });
    }
}
