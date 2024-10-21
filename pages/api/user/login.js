import prisma from "@/utils/db";
import { comparePassword, generateToken, generateTokenRefresh } from "@/utils/auth";

export default async function handler(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please provide both username and password" });
    }

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = generateToken(user);
    const refreshToken = generateTokenRefresh(user);

    // Save the refresh token to the user record
    await prisma.user.update({
        where: { username },
        data: { refreshToken },
    });

    return res.status(200).json({
        accessToken,
        refreshToken,
    });
}
