// pages/api/comment/[id].js

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
      const comment = await prisma.comment.findUnique({
        where: {
          id: Number(id),  // Convert the id from query string to a number
        },
        include: {
          author: true,    // Optionally include related author details
          blogPost: true,
          content: true,  // Optionally include related blog post details
        },
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Return the comment data as JSON
      return res.status(200).json(comment);
    } catch (error) {
      console.error('Error fetching comment:', error);
      return res.status(500).json({ error: 'Failed to retrieve comment' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
