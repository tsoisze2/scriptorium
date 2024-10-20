// pages/api/report/comment/delete.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { reportCommentId } = req.body;

    // Validate request body
    if (!reportCommentId || isNaN(Number(reportCommentId))) {
      return res.status(400).json({ error: 'Invalid reportComment ID' });
    }

    // Verify the user is an ADMIN
    const user = verifyTokenMdw(req);
    if (!user || user.role !== "ADMIN") {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the report exists
    const report = await prisma.reportComment.findUnique({
      where: { id: Number(reportCommentId) },
    });

    if (!report) {
      return res.status(404).json({ error: 'ReportComment not found' });
    }

    try {
      // Delete the report itself
      await prisma.reportComment.delete({
        where: { id: Number(reportCommentId) },
      });

      // Return success response
      return res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
      console.error('Error deleting report:', error);
      return res.status(500).json({ error: 'Failed to delete report' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
