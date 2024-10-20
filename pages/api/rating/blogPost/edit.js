import prisma from "@/utils/db";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { token } = req.headers;
    const { ratingId, upvote } = req.body;  // Modify the rating fields as needed

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      // Fetch the specific rating to verify the user is the author of the rating
      const rating = await prisma.ratingBlogPost.findUnique({
        where: { id: ratingId },
      });

      if (!rating || rating.authorId !== userId) {
        return res.status(403).json({ error: 'You are not allowed to edit this rating' });
      }

      // Update the specific rating
      const updatedRating = await prisma.ratingBlogPost.update({
        where: { id: ratingId },
        data: {
          upvote,  // not yet written
        },
      });

      res.status(200).json({ message: 'Rating updated successfully', rating: updatedRating });
    } catch (error) {
      console.error('Error editing rating:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
