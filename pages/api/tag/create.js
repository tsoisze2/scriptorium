import prisma from "@/utils/db";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name } = req.body;

    // Validate request body
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Tag name is required and should be a string' });
    }

    try {
      // Check if the tag already exists
      const existingTag = await prisma.tag.findUnique({
        where: { name: name.trim() },
      });

      if (existingTag) {
        return res.status(409).json({ error: 'Tag already exists' });
      }

      // Create the new tag
      const newTag = await prisma.tag.create({
        data: {
          name: name.trim(),  // Trim whitespace to avoid leading/trailing spaces
        },
      });

      // Return the newly created tag
      return res.status(201).json(newTag);
    } catch (error) {
      console.error('Error creating tag:', error);
      return res.status(500).json({ error: 'Failed to create tag' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}