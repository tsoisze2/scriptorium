import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    const { reportCommentId } = req.body;

    // Validate reportId
    if (!reportCommentId || isNaN(Number(reportCommentId))) {
      return res.status(400).json({ error: "Valid reportComment ID is required" });
    }

    // Validate user
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Find the report
      const report = await prisma.reportComment.findUnique({
        where: { id: Number(reportCommentId) },
      });

      // Check if the report exists
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      // Check if the user is allowed to resolve reports
      if (user.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden: You are not allowed to resolve this report" });
      }

      // Update the report to mark it as resolved
      const resolvedReport = await prisma.reportComment.update({
        where: { id: Number(reportCommentId) },
        data: { resolved: true },
      });

      return res.status(200).json(resolvedReport);
    } catch (error) {
      console.error("Error resolving report:", error);
      return res.status(500).json({ error: "Failed to resolve report" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
