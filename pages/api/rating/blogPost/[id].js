// pages/api/rating/blogPost/[id].js

import prisma from "@/utils/db";

export default async function handler(req, res) {
  const { id } = req.query;

  // Ensure the ID is a valid number
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid ID provided' });
  }

  if (req.method === 'GET') {
    try {
      // Fetch the rating by its ID
      const ratingBlogPost = await prisma.ratingBlogPost.findUnique({
        where: {
          id: Number(id),  // Convert the id from query string to a number
        },
        include: {
          author: true,    
          blogPost: true,   
          upvote: true,
        },
      });

      if (!ratingBlogPost) {
        return res.status(404).json({ error: 'Rating not found' });
      }

      // Return the ratingBlogPost data as JSON
      return res.status(200).json(ratingBlogPost);
    } catch (error) {
      console.error('Error fetching rating:', error);
      return res.status(500).json({ error: 'Failed to retrieve rating' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
