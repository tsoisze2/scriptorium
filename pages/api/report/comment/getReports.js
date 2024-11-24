import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";
import { pageSize } from "@/config";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { page = 1 } = req.body;

    // Verify the admin user making the request
    const user = verifyTokenMdw(req);
    if (!user || user.role !== "ADMIN") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate page to be a number
    if (isNaN(Number(page))) {
      return res.status(400).json({ error: "Invalid page number provided" });
    }

    const currentPage = Number(page);

    try {
      // Fetch reports with pagination and include related data
      const totalReports = await prisma.reportComment.count();

      const skip = (currentPage - 1) * pageSize;

      const reports = await prisma.reportComment.findMany({
        where: { resolved: false },
        skip,
        take: pageSize,
        include: {
          comment: true, // Include the related comment
          author: {
            select: { username: true }, // Include the author's username
          },
        },
      });

      const totalPages = Math.ceil(totalReports / pageSize);

      return res.status(200).json({
        reports,
        totalReports,
        totalPages,
        currentPage,
      });
    } catch (error) {
      console.error("Error fetching comment reports:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
