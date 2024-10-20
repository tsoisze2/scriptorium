import prisma from "@/utils/db";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { verifyTokenRefreshMdw } from "@/utils/auth"; 

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { token } = req.headers;
    const { firstName, lastName, email, phoneNum, avatarUrl, newPassword } = req.body;

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = verifyTokenRefreshMdw;

      let hashedPassword = null;
      if (newPassword) {
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          email,
          phoneNum,
          avatarUrl,
          ...(newPassword && { password: hashedPassword }),
        },
      });

      res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error during profile update:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
