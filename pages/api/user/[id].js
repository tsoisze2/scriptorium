// pages/api/user/[id].js

import prisma from "@/utils/db";

export default async function handler(req, res) {
  const { id } = req.query;

  // Ensure the ID is a valid number
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid ID provided' });
  }

  if (req.method === 'GET') {
    try {
      // Fetch the user by its ID
      const user = await prisma.user.findUnique({
        where: {
          id: Number(id),  // Convert the id from query string to a number
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return the user data as JSON
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Failed to retrieve user' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
