import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth"; // Middleware to verify the user

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Extract the user from the token
        const user = verifyTokenMdw(req);

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            // Remove the refresh token from the user's record
            await prisma.user.update({
                where: { username: user.username },
                data: { refreshToken: null },
            });

            return res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error("Error logging out user:", error);
            return res.status(500).json({ error: 'Failed to log out' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
