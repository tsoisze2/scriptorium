// pages/api/blogpost/edit.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";
import { convertTagsToArray } from "@/utils/format";

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { blogPostId, title, description, tags, content, codeTemplateId } = req.body;

    // Validate request body
    if (!title || !description || !content || (codeTemplateId && isNaN(Number(codeTemplateId))) || !blogPostId || isNaN(Number(blogPostId))) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // Validate user
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }


    try {
      // Set the loggedInUser
      const loggedInUser = await prisma.user.findUnique({
        where: { username: user.username },
        select: { id: true },
      });

      if (!loggedInUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Fetch the blogPost to ensure it exists and check the author
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: Number(blogPostId) },
        select: { authorId: true }, // Only need the authorId to compare
      });
      // Check if the logged-in user is the author of the blogPost
      if (blogPost.authorId !== loggedInUser.id) {
        return res.status(403).json({ error: 'You are not the author of this blogPost' });
      }

      if (codeTemplateId) {
        // Fetch the codeTemplate to ensure it exists 
        const codeTemplate = await prisma.codeTemplate.findUnique({
          where: { id: Number(codeTemplateId) },
          select: { authorId: true },
        });

        if (!codeTemplate) {
          return res.status(404).json({ error: 'CodeTemplate not found' });
        }
      }

      // Handle tags if provided
      let tagsToConnect = [];
      if (tags) {
        const tagsArray = convertTagsToArray(tags);
        tagsToConnect = await Promise.all(
          tagsArray.map(async (tagName) => {
            const existingTag = await prisma.tag.findUnique({
              where: { name: tagName },
            });

            if (existingTag) {
              return { id: existingTag.id }; // If tag exists, return its ID to connect
            } else {
              const newTag = await prisma.tag.create({
                data: { name: tagName },
              });
              return { id: newTag.id }; // Return the ID of the newly created tag
            }
          })
        );
      }

      // Modify the blogPost
      const updatedBlogPost = await prisma.blogPost.update({
        where: { id: Number(blogPostId) },
        data: {
          title: title,
          description: description,
          content: content,
          ...(codeTemplateId && {
            codeTemplate: {
              connect: { id: Number(codeTemplateId) }
            },
          }),
          ...(tagsToConnect.length > 0 && {
            tags: {
              connect: tagsToConnect, // Connect the blog post with the tags
            },
          }),
        }
      });

      // Return the updated blogPost
      return res.status(201).json(updatedBlogPost);
    } catch (error) {
      console.error('Error editing blogPost:', error);
      return res.status(500).json({ error: 'Failed to edit blogPost' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
