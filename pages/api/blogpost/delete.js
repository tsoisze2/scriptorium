// pages/api/blogpost/delete.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth"; 

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { blogPostId } = req.body; 

    // Validate blogPost ID
    if (!blogPostId || isNaN(Number(blogPostId))) {
      return res.status(400).json({ error: 'Invalid or missing blogPost ID' });
    }

    // Verify the user making the request
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Fetch the blogPost to ensure it exists and check the author
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: Number(blogPostId) },
        select: { authorId: true }, // Only need the authorId to compare
      });

      if (!blogPost) {
        return res.status(404).json({ error: 'blogPost not found' });
      }

      // Check if the logged-in user is the author of the blogPost
      const loggedInUser = await prisma.user.findUnique({
        where: { username: user.username },
        select: { id: true },
      });
      if (blogPost.authorId !== loggedInUser.id) {
        return res.status(403).json({ error: 'You are not the author of this blogPost' });
      }

      // Delete the blogPost itself
      await prisma.blogPost.delete({
        where: { id: Number(blogPostId) },
      });

      return res.status(200).json({ message: 'BlogPost deleted successfully' });
    } catch (error) {
      console.error('Error deleting blogPost:', error);
      return res.status(500).json({ error: 'Failed to delete blogPost' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
