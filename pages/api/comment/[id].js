import prisma from "@/utils/db";

export default async function handler(req, res) {
  const { id } = req.query;

  // Validate the blogPost ID
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid blogPost ID" });
  }

  if (req.method === "GET") {
    try {
      // Fetch all comments for the blogPost
      const comments = await prisma.comment.findMany({
        where: {
          blogPostId: Number(id),
          visibleToPublic: true, // Ensure only visible comments are fetched
        },
        include: {
          author: {
            select: {
              username: true, // Fetch author username
            },
          },
        },
        orderBy: {
          createdAt: "asc", // Sort comments by creation date
        },
      });

      return res.status(200).json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
