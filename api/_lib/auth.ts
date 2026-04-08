import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { VercelRequest } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const SALT_ROUNDS = 10;

export interface JwtPayload {
    userId: string;
    username: string;
}

export function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

export function getUserFromRequest(req: VercelRequest): JwtPayload | null {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return null;
    return verifyToken(header.slice(7));
}

export function cors(res: import('@vercel/node').VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}
