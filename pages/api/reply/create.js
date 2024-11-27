// pages/api/reply/create.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content, commentId, replyingToId } = req.body;

    // Validate request body
    if (!content || !commentId || isNaN(Number(commentId))) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate user
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
      // Set the authorId 
      const loggedInUser = await prisma.user.findUnique({
        where: { username: user.username },
        select: { id: true },
      });
      if (!loggedInUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create a new reply
      const newReply = await prisma.reply.create({
        data: {
          content: content,
          visibleToPublic: true, // Set to true by default
          author: {
            connect: { id: loggedInUser.id }, // Link to the author by their ID
          },
          comment: {
            connect: { id: Number(commentId) }, // Link to the blog post by its ID
          },
          ...(replyingToId && {
            replyingTo: { connect: { id: Number(replyingToId) } }, // Conditionally add replyingTo
          }),
        },
        include: {
          author: true,
        }
      });

      // Return the newly created reply
      return res.status(201).json(newReply);
    } catch (error) {
      console.error('Error creating reply:', error);
      return res.status(500).json({ error: 'Failed to create reply' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
