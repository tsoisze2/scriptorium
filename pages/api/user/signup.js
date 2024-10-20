import prisma from "@/utils/db";
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password, firstName, lastName, email, phoneNum, avatarUrl } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          firstName,
          lastName,
          email,
          phoneNum,
          avatarUrl,
        },
      });

      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error('Error during user registration:', error);
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Username or email already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
