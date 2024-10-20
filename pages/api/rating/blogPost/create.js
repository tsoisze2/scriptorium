// pages/api/rating/blogPost/create.js

import prisma from "@/utils/db";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { upvote, authorId, blogPostId } = req.body;

    // Validate request body
    if ((upvote !== "true" && upvote !== "false") || !authorId || !blogPostId || isNaN(Number(authorId)) || isNaN(Number(authorId))) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate user

    // Validate blogPost
    const blogPostExists = await prisma.blogPost.findUnique({
      where: { id: Number(blogPostId) },
    });
    if (!blogPostExists) {
      return res.status(404).json({ message: 'blogPost ID does not exist' });
    }


    const isUpvote = upvote === "true";

    try {
      // Create a new rating
      const newRating = await prisma.ratingBlogPost.create({
        data: {
          upvote: isUpvote,
          author: {
            connect: { id: Number(authorId) }, // Link to the author by their ID
          },
          blogPost: {
            connect: { id: Number(blogPostId) }, // Link to the blog post by its ID
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
