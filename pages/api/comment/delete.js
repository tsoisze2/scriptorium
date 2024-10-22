// pages/api/comment/delete.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth"; 

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { commentId } = req.body; // Assuming the comment ID is passed in the body

    // Validate comment ID
    if (!commentId || isNaN(Number(commentId))) {
      return res.status(400).json({ error: 'Invalid or missing comment ID' });
    }

    // Verify the user making the request
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Fetch the comment to ensure it exists and check the author
      const comment = await prisma.comment.findUnique({
        where: { id: Number(commentId) },
        select: { authorId: true }, // Only need the authorId to compare
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Check if the logged-in user is the author of the comment
      const loggedInUser = await prisma.user.findUnique({
        where: { username: user.username },
        select: { id: true },
      });
      if (comment.authorId !== loggedInUser.id) {
        return res.status(403).json({ error: 'You are not the author of this comment' });
      }

      // Delete the comment itself
      await prisma.comment.delete({
        where: { id: Number(commentId) },
      });

      return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
