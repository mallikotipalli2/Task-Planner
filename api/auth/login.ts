import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, comparePassword, signToken, cors } from '../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { username, password } = req.body ?? {};

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanUsername = username.trim().toLowerCase();

    const { data: user, error } = await supabase
        .from('users')
        .select('id, username, password_hash')
        .eq('username', cleanUsername)
        .single();

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = signToken({ userId: user.id, username: user.username });

    return res.status(200).json({
        token,
        user: { id: user.id, username: user.username },
    });
}
