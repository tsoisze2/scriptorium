// pages/api/codeTemplate/[id].js

import prisma from "@/utils/db";

export default async function handler(req, res) {
  const { id } = req.query;

  // Ensure the ID is a valid number
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid ID provided' });
  }

  if (req.method === 'GET') {
    try {
      // Fetch the comment by its ID
      const template = await prisma.codeTemplate.findUnique({
        where: {
          id: Number(id),  // Convert the id from query string to a number
        },
      });

      if (!template) {
        return res.status(404).json({ error: 'Code Template not found' });
      }

      // Return the template data as JSON
      return res.status(200).json(template);
    } catch (error) {
      console.error('Error fetching comment:', error);
      return res.status(500).json({ error: 'Failed to retrieve comment' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
