import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    const results: Record<string, any> = {};

    try {
        const { hashPassword, comparePassword, signToken, verifyToken } = await import('./_lib/auth');
        results.auth_import = 'ok';
        results.hashPassword_type = typeof hashPassword;
        results.signToken_type = typeof signToken;

        const hash = await hashPassword('test123');
        results.hash_works = hash.startsWith('$2');

        const token = signToken({ userId: 'test-id', username: 'test' });
        results.token_works = token.startsWith('eyJ');

        const decoded = verifyToken(token);
        results.verify_works = decoded?.username === 'test';
    } catch (e: any) {
        results.auth_error = e.message;
        results.auth_stack = e.stack?.split('\n').slice(0, 3);
    }

    try {
        const { supabase } = await import('./_lib/supabase');
        results.supabase_import = 'ok';
        const { data, error } = await supabase.from('users').select('id').limit(1);
        results.supabase_query = error ? 'ERROR: ' + error.message : 'ok, rows: ' + (data?.length ?? 0);
    } catch (e: any) {
        results.supabase_error = e.message;
    }

    res.status(200).json(results);
}
