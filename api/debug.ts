import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    const results: Record<string, any> = {};

    try {
        const bcrypt = await import('bcryptjs');
        results.bcryptjs_keys = Object.keys(bcrypt);
        results.bcryptjs_hash = typeof bcrypt.hash;
        results.bcryptjs_default = typeof (bcrypt as any).default;
        results.bcryptjs_default_hash = typeof (bcrypt as any).default?.hash;
    } catch (e: any) {
        results.bcryptjs = 'FAIL: ' + e.message;
    }

    try {
        const jwt = await import('jsonwebtoken');
        results.jwt_keys = Object.keys(jwt);
        results.jwt_sign = typeof jwt.sign;
        results.jwt_default = typeof (jwt as any).default;
        results.jwt_default_sign = typeof (jwt as any).default?.sign;
    } catch (e: any) {
        results.jwt = 'FAIL: ' + e.message;
    }

    res.status(200).json(results);
}
