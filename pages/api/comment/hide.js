// pages/api/comment/hide.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === 'PATCH') {
    const { commentId } = req.body;

    // Validate request body
    if (!commentId || isNaN(Number(commentId))) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    // Verify the user is an ADMIN
    const user = verifyTokenMdw(req);
    if (!user || user.role !== "ADMIN") {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ error: 'comment not found' });
    }

    try {
      // Hide the comment
      await prisma.comment.update({
        where: { id: Number(commentId) },
        data: { visibleToPublic: false },
      });

      // Return success response
      return res.status(200).json({ message: 'Comment hidden successfully' });
    } catch (error) {
      console.error('Error hiding comment:', error);
      return res.status(500).json({ error: 'Failed to hide comment' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
