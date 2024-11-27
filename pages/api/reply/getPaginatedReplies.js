import prisma from "@/utils/db";
import { pageSize } from "@/config";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { commentId, page = 1 } = req.body;

    // Validate the inputs
    if (!commentId || isNaN(Number(commentId))) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    if (isNaN(Number(page))) {
      return res.status(400).json({ error: "Invalid page number" });
    }

    const currentPage = Number(page);

    try {
      // Get the total count of replies for the specified comment
      const totalReplies = await prisma.reply.count({
        where: {
          commentId: Number(commentId),
        },
      });

      // Calculate pagination offset
      const skip = (currentPage - 1) * pageSize;

      // Fetch the paginated replies
      const replies = await prisma.reply.findMany({
        where: {
          commentId: Number(commentId),
        },
        include: {
          author: true, // Include the author details
        },
        orderBy: {
          createdAt: "asc", // Sort by creation date
        },
        skip: skip,
        take: pageSize,
      });

      // Calculate the total number of pages
      const totalPages = Math.ceil(totalReplies / pageSize);

      // Respond with paginated data
      return res.status(200).json({
        replies,
        totalPages,
        currentPage,
      });
    } catch (error) {
      console.error("Error fetching paginated replies:", error);
      return res.status(500).json({ error: "Failed to fetch replies" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
