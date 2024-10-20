import prisma from "@/utils/db";
import { verifyTokenMdw, hashPassword } from "@/utils/auth"; 

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const user = verifyTokenMdw(req);
    const { firstName, lastName, email, phoneNum, avatarUrl, newPassword } = req.body;

    try {
      const username = user.username;

      let hashedPassword = null;
      if (newPassword) {
        hashedPassword = await hashPassword(newPassword);
      }

      const updatedUser = await prisma.user.update({
        where: { username: username },
        data: {
          ...(firstName && { firstName: firstName }),
          ...(lastName && { lastName: lastName }),
          ...(email && { email: email }),
          ...(phoneNum && { phoneNum: phoneNum }),
          ...(avatarUrl && { avatarUrl: avatarUrl }),
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
