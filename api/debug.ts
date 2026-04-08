import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    const results: Record<string, any> = {};
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_KEY || ''
        );
        const { data, error } = await supabase.from('users').select('id').limit(1);
        results.supabase = error ? 'ERROR: ' + error.message : 'ok, rows: ' + (data?.length ?? 0);
    } catch (e: any) {
        results.supabase = 'FAIL: ' + e.message;
    }
    try {
        const hash = await bcrypt.hash('test', 10);
        results.bcrypt = 'ok: ' + hash.substring(0, 10);
    } catch (e: any) {
        results.bcrypt = 'FAIL: ' + e.message;
    }
    try {
        const token = jwt.sign({ test: 1 }, 'secret');
        results.jwt = 'ok: ' + token.substring(0, 10);
    } catch (e: any) {
        results.jwt = 'FAIL: ' + e.message;
    }
    res.status(200).json(results);
}
