// pages/api/report/reply/delete.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { reportReplyId } = req.body;

    // Validate request body
    if (!reportReplyId || isNaN(Number(reportReplyId))) {
      return res.status(400).json({ error: 'Invalid reportReply ID' });
    }

    // Verify the user is an ADMIN
    const user = verifyTokenMdw(req);
    if (!user || user.role !== "ADMIN") {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the report exists
    const report = await prisma.reportReply.findUnique({
      where: { id: Number(reportReplyId) },
    });

    if (!report) {
      return res.status(404).json({ error: 'ReportReply not found' });
    }

    try {
      // Delete the report itself
      await prisma.reportReply.delete({
        where: { id: Number(reportReplyId) },
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
