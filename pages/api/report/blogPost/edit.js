import prisma from "@/utils/db";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { token } = req.headers;
    const { reportId, newContent } = req.body; // Content of the report to be updated

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      // Fetch the report to ensure it exists and belongs to the user
      const report = await prisma.reportBlogPost.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      if (report.authorId !== userId) {
        return res.status(403).json({ error: 'You are not allowed to edit this report' });
      }

      // Update the specific report content
      const updatedReport = await prisma.reportBlogPost.update({
        where: { id: reportId },
        data: {
          content: newContent,  // Update the content of the report
        },
      });

      res.status(200).json({ message: 'Report updated successfully', report: updatedReport });
    } catch (error) {
      console.error('Error editing report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
