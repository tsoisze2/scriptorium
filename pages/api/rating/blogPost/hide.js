import prisma from '../../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { token } = req.headers;
    const { ratingId } = req.body; // Use ratingId instead of postId

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      const userRole = decoded.role;

      // Only allow admins to hide ratings
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'You are not allowed to hide ratings' });
      }

      // Fetch the rating to ensure it exists
      const rating = await prisma.ratingBlogPost.findUnique({
        where: { id: ratingId },
      });

      if (!rating) {
        return res.status(404).json({ error: 'Rating not found' });
      }

      // Hide the specific rating 
      const hiddenRating = await prisma.ratingBlogPost.update({
        where: { id: ratingId },
        data: {
          visibleToPublic: false,  //not yet writted
        },
      });

      res.status(200).json({ message: 'Rating hidden successfully', rating: hiddenRating });
    } catch (error) {
      console.error('Error hiding rating:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
