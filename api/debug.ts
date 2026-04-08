import type { VercelRequest, VercelResponse } from '@vercel/node';
from '../lib/helpers.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    cors(res);
    const results: Record<string, any> = {};
    try {
        const hash = await hashPassword('test123');
        results.bcrypt = 'ok: ' + hash.substring(0, 10);
        const token = signToken({ userId: 'x', username: 'test' });
        results.jwt = 'ok: ' + token.substring(0, 10);
        results.verify = verifyToken(token)?.username === 'test';
    } catch (e: any) {
        results.auth_error = e.message;
    }
    try {
        const { data, error } = await supabase.from('users').select('id').limit(1);
        results.supabase = error ? 'ERROR: ' + error.message : 'ok, rows: ' + (data?.length ?? 0);
    } catch (e: any) {
        results.supabase = 'FAIL: ' + e.message;
    }
    res.status(200).json(results);
}
