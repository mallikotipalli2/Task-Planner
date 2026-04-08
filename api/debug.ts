import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_KEY || ''
        );
        const { data, error } = await supabase.from('users').select('id').limit(1);
        res.status(200).json({
            supabase: 'ok',
            query: error ? 'ERROR: ' + error.message : 'ok, rows: ' + (data?.length ?? 0)
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}
