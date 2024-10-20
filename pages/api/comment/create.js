// pages/api/comment/create.js

import prisma from "@/utils/db";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content, authorId, blogPostId } = req.body;

    // Validate request body
    if (!content || !authorId || !blogPostId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Create a new comment
      const newComment = await prisma.comment.create({
        data: {
          content: content,
          visibleToPublic: true, // Set to true by default
          createdAt: new Date(), // Set the current date
          author: {
            connect: { id: authorId }, // Link to the author by their ID
          },
          blogPost: {
            connect: { id: blogPostId }, // Link to the blog post by its ID
          },
        },
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
