// pages/api/codeTemplate/edit.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";
import { convertTagsToArray } from "@/utils/format"; 

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { codeTemplateId, title, code, explanation, language, tags } = req.body;

    // Validate request body
    if (!title || !code || !explanation || !language || !codeTemplateId || isNaN(Number(codeTemplateId))) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // Validate user
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate language type 
    if (language !== "C" && language !== "C++" && language !== "Java" && language !== "Python" && language !== "JavaScript") {
      return res.status(400).json({ error: 'Language has to be one of the following: C, C++, Java, Python, JavaScript' })
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

      // Fetch the codeTemplate to ensure it exists and check the author
      const codeTemplate = await prisma.codeTemplate.findUnique({
        where: { id: Number(codeTemplateId) },
        select: { authorId: true }, // Only need the authorId to compare
      });

      if (!codeTemplate) {
        return res.status(404).json({ error: 'CodeTemplate not found' });
      }
      // Check if the logged-in user is the author of the codeTemplate
      if (codeTemplate.authorId !== loggedInUser.id) {
        return res.status(403).json({ error: 'You are not the author of this codeTemplate' });
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

      // Modify the codeTemplate
      const updatedCodeTemplate = await prisma.codeTemplate.update({
        where: { id: Number(codeTemplateId) },
        data: {
          title: title, 
          code: code,
          explanation: explanation,
          language: language,
          ...(tagsToConnect.length > 0 && {
            tags: {
              connect: tagsToConnect, // Connect the codeTemplate with the tags
            },
          }),
        },
      });

      // Return the updated codeTemplate
      return res.status(201).json(updatedCodeTemplate);
    } catch (error) {
      console.error('Error editing codeTemplate:', error);
      return res.status(500).json({ error: 'Failed to edit codeTemplate' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
