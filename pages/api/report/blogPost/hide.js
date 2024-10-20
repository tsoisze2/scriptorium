import prisma from "@/utils/db";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { token } = req.headers;
    const { reportId } = req.body;

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      const userRole = decoded.role;

      // Only allow admins to hide reports
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'You are not allowed to hide this report' });
      }

      // Fetch the report to ensure it exists
      const report = await prisma.reportBlogPost.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Hide the specific report
      const hiddenReport = await prisma.reportBlogPost.update({
        where: { id: reportId },
        data: {
          visibleToPublic: false,  // Mark report as hidden
        },
      });

      res.status(200).json({ message: 'Report hidden successfully', report: hiddenReport });
    } catch (error) {
      console.error('Error hiding report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
