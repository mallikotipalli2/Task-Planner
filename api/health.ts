import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        status: 'ok',
        checks: {
            SUPABASE_URL: !!process.env.SUPABASE_URL,
            SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
            JWT_SECRET: !!process.env.JWT_SECRET,
        },
    });
}
