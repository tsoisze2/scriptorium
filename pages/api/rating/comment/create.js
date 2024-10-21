// pages/api/rating/comment/create.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { upvote, commentId } = req.body;

    // Validate request body
    if ((upvote !== "true" && upvote !== "false") || !commentId || isNaN(Number(commentId))) {
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

    const isUpvote = upvote === "true";

    try {
      // Set the authorId 
      const loggedInUser = await prisma.user.findUnique({
        where: { username: user.username },
        select: { id: true },
      });
      if (!loggedInUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if the user has already rated this comment
      const existingRating = await prisma.ratingComment.findFirst({
        where: {
          authorId: loggedInUser.id,
          blogPostId: Number(commentId),
        },
      });

      if (existingRating) {
        return res.status(409).json({ error: 'You have already rated this comment' });
      }

      // Create a new rating
      const newRating = await prisma.ratingComment.create({
        data: {
          upvote: isUpvote,
          author: {
            connect: { id: loggedInUser.id }, // Link to the author by their ID
          },
          comment: {
            connect: { id: Number(commentId) }, // Link to the comment by its ID
          },
        },
      });

      // Return the newly created rating
      return res.status(201).json(newRating);
    } catch (error) {
      console.error('Error creating rating:', error);
      return res.status(500).json({ error: 'Failed to create rating' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
