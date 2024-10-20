// pages/api/rating/comment/create.js

import prisma from "@/utils/db";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { upvote, authorId, commentId } = req.body;

    // Validate request body
    if ((upvote !== "true" && upvote !== "false") || !authorId || !commentId || isNaN(Number(authorId)) || isNaN(Number(commentId))) {
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

    const isUpvote = upvote === "true";

    try {
      // Create a new rating
      const newRating = await prisma.ratingComment.create({
        data: {
          upvote: isUpvote,
          author: {
            connect: { id: Number(authorId) }, // Link to the author by their ID
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
