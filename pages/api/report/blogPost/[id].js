// pages/api/report/blogPost/[id].js

import prisma from "@/utils/db";

export default async function handler(req, res) {
  const { id } = req.query;

  // Ensure the ID is a valid number
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid ID provided' });
  }

  if (req.method === 'GET') {
    try {
      // Fetch the report by its ID
      const report = await prisma.reportBlogPost.findUnique({
        where: {
          id: Number(id),  // Convert the id from query string to a number
        },
      });

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Return the report data as JSON
      return res.status(200).json(report);
    } catch (error) {
      console.error('Error fetching report:', error);
      return res.status(500).json({ error: 'Failed to retrieve report' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}