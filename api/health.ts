import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
    const checks = {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
        JWT_SECRET: !!process.env.JWT_SECRET,
    };
    const allOk = Object.values(checks).every(Boolean);
    res.status(allOk ? 200 : 500).json({
        status: allOk ? 'ok' : 'missing env vars',
        checks,
    });
}
