// pages/api/blogpost/hide.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { blogPostId } = req.body;

    // Validate request body
    if (!blogPostId || isNaN(Number(blogPostId))) {
      return res.status(400).json({ error: 'Invalid blogPost ID' });
    }

    // Verify the user is an ADMIN
    const user = verifyTokenMdw(req);
    if (!user || user.role !== "ADMIN") {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the blogPost exists
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: Number(blogPostId) },
    });

    if (!blogPost) {
      return res.status(404).json({ error: 'blogPost not found' });
    }

    try {
      // Hide the blogPost
      await prisma.blogPost.update({
        where: { id: Number(blogPostId) },
        data: { visibleToPublic: false },
      });

      // Return success response
      return res.status(200).json({ message: 'BlogPost hidden successfully' });
    } catch (error) {
      console.error('Error hiding blogPost:', error);
      return res.status(500).json({ error: 'Failed to hide blogPost' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
