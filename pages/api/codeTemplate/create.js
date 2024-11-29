// pages/api/codeTemplate/create.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";
import { convertTagsToArray } from "@/utils/format"; 

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, code, explanation, language, tags } = req.body;

    // Validate request body
    if (!title || !code || !explanation || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate user
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate language type 
    if (language !== "c" && language !== "cpp" && language !== "java" && language !== "python" && language !== "javascript") {
      return res.status(400).json({ error: 'Language has to be one of the following: C, C++, Java, Python, JavaScript' })
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

      // Create a new codeTemplate
      const newCodeTemplate = await prisma.codeTemplate.create({
        data: {
          title: title, 
          code: code,
          explanation: explanation,
          language: language,
          author: {
            connect: { id: loggedInUser.id }, // Link to the author by their ID
          },
          ...(tagsToConnect.length > 0 && {
            tags: {
              connect: tagsToConnect, // Connect the codeTemplate with the tags
            },
          }),
        },
      });

      // Return the newly created codeTemplate
      return res.status(201).json(newCodeTemplate);
    } catch (error) {
      console.error('Error creating codeTemplate:', error);
      return res.status(500).json({ error: 'Failed to create codeTemplate' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
