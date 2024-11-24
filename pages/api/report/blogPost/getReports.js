import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";
import { pageSize } from "@/config";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { page = 1 } = req.body;

  // Validate the page number
  if (isNaN(Number(page))) {
    return res.status(400).json({ error: "Invalid page number" });
  }

  const currentPage = Number(page);

  // Verify the user is an admin
  const user = verifyTokenMdw(req);
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    // Count total unresolved reports
    const totalReports = await prisma.reportBlogPost.count({
      where: { resolved: false },
    });

    // Calculate pagination offsets
    const skip = (currentPage - 1) * pageSize;

    // Fetch unresolved blog post reports
    const reports = await prisma.reportBlogPost.findMany({
      where: { resolved: false },
      include: {
        blogPost: true,
        author: true,
      },
      skip,
      take: pageSize,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalReports / pageSize);

    return res.status(200).json({ reports, totalReports, totalPages, currentPage });
  } catch (error) {
    console.error("Error fetching blog post reports:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
