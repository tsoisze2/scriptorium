import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const BCRYPT_SALT_ROUNDS = 10;
const JWT_SECRET = "sdkfjerwljflksdjfjgfsdfs";
const JWT_SECRET_REFRESH = "burhasdkfjsafdasf1242458938w4e";
const JWT_EXPIRES_IN = "1d";
const JWT_EXPIRES_IN_SHORT = "15m";

export async function hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

export function generateToken(user) {
    const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;
    const payload = {
        username: user.username,
        role: user.role,
        expiresAt: expiresAt,
    };
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN_SHORT,
    });
}

export function generateTokenRefresh(user) {
    const expiresAt = Math.floor(Date.now() / 1000) + 86400;
    const payload = {
        username: user.username,
        role: user.role,
        expiresAt: expiresAt,
    };
    return jwt.sign(payload, JWT_SECRET_REFRESH, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

export function verifyToken(token) {
    if (!token?.startsWith("Bearer ")) {
        return null;
    }
    token = token.split(" ")[1];

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

export function verifyTokenRefresh(token) {
    if (!token?.startsWith("Bearer ")) {
        return null;
    }
    token = token.split(" ")[1];

    try {
        return jwt.verify(token, JWT_SECRET_REFRESH);
    } catch (err) {
        return null;
    }
}

export function verifyTokenMdw(req) {
    const authHeader = req.headers['authorization'];
    const token = verifyToken(authHeader);

    try {
        const { username, role } = token;
        return { username, role };
    } catch (err) {
        return null;
    }
}

export function verifyTokenRefreshMdw(req) {
    const authHeader = req.headers['authorization'];
    const token = verifyTokenRefresh(authHeader);

    try {
        const { username, role } = token;
        return { username, role };
    } catch (err) {
        return null;
    }
}
