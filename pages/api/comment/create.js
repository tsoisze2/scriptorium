// pages/api/comment/create.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content, blogPostId } = req.body;

    // Validate request body
    if (!content || !blogPostId || isNaN(Number(blogPostId))) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate user
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate blogPost
    const blogPostExists = await prisma.blogPost.findUnique({
      where: { id: Number(blogPostId) },
    });
    if (!blogPostExists) {
      return res.status(404).json({ message: 'blogPost ID does not exist' });
    }

    try {
      // Set the authorId 
      const loggedInUser = await prisma.user.findUnique({
        where: { username: user.username },
        select: { id: true },
      });

      if (!loggedInUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create a new comment
      const newComment = await prisma.comment.create({
        data: {
          content: content,
          visibleToPublic: true, // Set to true by default
          createdAt: new Date(), // Set the current date
          author: {
            connect: { id: loggedInUser.id }, // Link to the author by their ID
          },
          blogPost: {
            connect: { id: Number(blogPostId) }, // Link to the blog post by its ID
          },
        },
        include: {
          author: true,
          ratings: true, // Include ratings so we can calculate the score
          replies: true  // Include replies 
        }

      });

      // Return the newly created comment
      return res.status(201).json(newComment);
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Failed to create comment' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
