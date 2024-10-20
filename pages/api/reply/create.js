// pages/api/reply/create.js

import prisma from "@/utils/db";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content, authorId, commentId, replyingToId } = req.body;

    // Validate request body
    if (!content || !authorId || !commentId || isNaN(Number(authorId)) || isNaN(Number(commentId))) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate user

    // Validate commentId
    const commentExists = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
    });
    if (!commentExists) {
      return res.status(404).json({ message: 'comment ID does not exist' });
    }


    // Validate replyingToId
    if (replyingToId) {
      if (isNaN(Number(replyingToId))) {
        return res.status(400).json({ message: 'Invalid replyingTo ID provided' });
      }
      const replyingToExists = await prisma.reply.findUnique({
        where: { id: Number(replyingToId) },
      });
      if (!replyingToExists) {
        return res.status(404).json({ message: 'replyingTo ID does not exist' });
      }
    }

    try {
      // Create a new reply
      const newReply = await prisma.reply.create({
        data: {
          content: content,
          visibleToPublic: true, // Set to true by default
          createdAt: new Date(), // Set the current date
          author: {
            connect: { id: Number(authorId) }, // Link to the author by their ID
          },
          comment: {
            connect: { id: Number(commentId) }, // Link to the blog post by its ID
          },
          ...({ connect: { id: Number(replyingToId) } } && { replyingTo: { connect: { id: Number(replyingToId) } } }),
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
