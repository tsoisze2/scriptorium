// pages/api/blogpost/[id].js

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
      const blogPost = await prisma.blogPost.findUnique({
        where: {
          id: Number(id),  // Convert the id from query string to a number
        },
        include: {
          author: true,
          tags: true,
          codeTemplate: true,
        }
      });

      if (!blogPost) {
        return res.status(404).json({ error: 'Blog Post not found' });
      }

      // Return the template data as JSON
      return res.status(200).json(blogPost);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return res.status(500).json({ error: 'Failed to retrieve blog post' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
