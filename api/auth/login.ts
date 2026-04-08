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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        cors(res);
        if (req.method === 'OPTIONS') return res.status(204).end();
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

        const { username, password } = req.body ?? {};
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

        const cleanUsername = username.trim().toLowerCase();

        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, password_hash')
            .eq('username', cleanUsername)
            .single();

        if (error || !user) return res.status(401).json({ error: 'Invalid username or password' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
        return res.status(200).json({ token, user: { id: user.id, username: user.username } });
    } catch (err: any) {
        return res.status(500).json({ error: 'Internal server error', detail: err?.message });
    }
}
