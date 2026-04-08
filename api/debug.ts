import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { hashPassword, signToken, verifyToken, cors } from './_lib/auth';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    cors(res);
    const results: Record<string, any> = {};

    try {
        results.hashPassword_type = typeof hashPassword;
        results.signToken_type = typeof signToken;

        const hash = await hashPassword('test123');
        results.hash_works = typeof hash === 'string' && hash.startsWith('$2');

        const token = signToken({ userId: 'test-id', username: 'test' });
        results.token_works = typeof token === 'string' && token.startsWith('eyJ');

        const decoded = verifyToken(token);
        results.verify_works = decoded?.username === 'test';
    } catch (e: any) {
        results.auth_error = e.message;
    }

    try {
        const { data, error } = await supabase.from('users').select('id').limit(1);
        results.supabase_query = error ? 'ERROR: ' + error.message : 'ok, rows: ' + (data?.length ?? 0);
    } catch (e: any) {
        results.supabase_error = e.message;
    }

    res.status(200).json(results);
}
