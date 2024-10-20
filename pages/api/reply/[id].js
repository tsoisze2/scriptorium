// pages/api/reply/[id].js

import prisma from "@/utils/db";

export default async function handler(req, res) {
  const { id } = req.query;

  // Ensure the ID is a valid number
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid ID provided' });
  }

  if (req.method === 'GET') {
    try {
      // Fetch the comment by its ID
      const reply = await prisma.reply.findUnique({
        where: {
          id: Number(id),  // Convert the id from query string to a number
        },
        include: {
          author: true,
          blogPost: true,
          comment: true,
          replyingTo: true,
          content: true,
        },
      });

      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }

      // Return the reply data as JSON
      return res.status(200).json(reply);
    } catch (error) {
      console.error('Error fetching reply:', error);
      return res.status(500).json({ error: 'Failed to retrieve reply' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
