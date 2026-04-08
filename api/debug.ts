import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    const results: Record<string, string> = {};

    try {
        const { createClient } = await import('@supabase/supabase-js');
        results.supabase = 'ok: ' + typeof createClient;
    } catch (e: any) {
        results.supabase = 'FAIL: ' + e.message;
    }

    try {
        const bcrypt = await import('bcryptjs');
        results.bcryptjs = 'ok: ' + typeof bcrypt.hash;
    } catch (e: any) {
        results.bcryptjs = 'FAIL: ' + e.message;
    }

    try {
        const jwt = await import('jsonwebtoken');
        results.jsonwebtoken = 'ok: ' + typeof jwt.sign;
    } catch (e: any) {
        results.jsonwebtoken = 'FAIL: ' + e.message;
    }

    res.status(200).json(results);
}
