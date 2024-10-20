// pages/api/rating/comment/delete.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth"; 

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { ratingCommentId } = req.body; 

    // Validate ratingComment Id
    if (!ratingCommentId || isNaN(Number(ratingCommentId))) {
      return res.status(400).json({ error: 'Invalid or missing ratingComment ID' });
    }

    // Verify the user making the request
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Fetch the rating to ensure it exists and check the author
      const rating = await prisma.ratingComment.findUnique({
        where: { id: Number(ratingCommentId) },
        select: { authorId: true }, // Only need the authorId to compare
      });

      if (!rating) {
        return res.status(404).json({ error: 'RatingComment not found' });
      }

      // Check if the logged-in user is the author of the rating
      const author = await prisma.user.findUnique({
        where: { username: user.username },
        select: { id: true },
      });

      if (rating.authorId !== author.id) {
        return res.status(403).json({ error: 'You are not the author of this ratingComment' });
      }

      // Delete the rating if the user is authorized
      await prisma.ratingComment.delete({
        where: { id: Number(ratingCommentId) },
      });

      return res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
      console.error('Error deleting rating:', error);
      return res.status(500).json({ error: 'Failed to delete rating' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
