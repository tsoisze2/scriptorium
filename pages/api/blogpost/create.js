import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";
import { convertTagsToArray } from "@/utils/format";  // Assuming we already have this utility function

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, description, tags, content, codeTemplateId } = req.body;

    // Validate the request body
    if (!title || !description || !content || (codeTemplateId && isNaN(Number(codeTemplateId)))) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate user
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Get the logged-in user's ID
      const loggedInUser = await prisma.user.findUnique({
        where: { username: user.username },
        select: { id: true },
      });

      if (!loggedInUser) {
        return res.status(404).json({ error: 'User not found' });
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

      // Create the blog post
      const newBlogPost = await prisma.blogPost.create({
        data: {
          title: title,
          description: description,
          content: content,
          author: {
            connect: { id: loggedInUser.id }, // Link to the author by their ID
          },
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
        },
      });

      // Return the newly created blog post
      return res.status(201).json(newBlogPost);
    } catch (error) {
      console.error('Error creating blog post:', error);
      return res.status(500).json({ error: 'Failed to create blog post' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
