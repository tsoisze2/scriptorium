import prisma from "@/utils/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { blogPostId, page = 1 } = req.body;

    // Validate input
    if (!blogPostId || isNaN(Number(blogPostId))) {
      return res.status(400).json({ error: "Invalid or missing blogPost ID" });
    }

    if (isNaN(Number(page))) {
      return res.status(400).json({ error: "Invalid page number provided" });
    }

    const currentPage = Number(page);
    const pageSize = 10; // Define the number of comments per page

    try {
      // Check if the blog post exists
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: Number(blogPostId) },
        select: { id: true },
      });

      if (!blogPost) {
        return res.status(404).json({ error: "BlogPost not found" });
      }

      // Fetch comments with authors and replies
      const comments = await prisma.comment.findMany({
        where: {
          blogPostId: Number(blogPostId),
          visibleToPublic: true,
        },
        include: {
          author: {
            select: {
              username: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      });

      const totalComments = await prisma.comment.count({
        where: {
          blogPostId: Number(blogPostId),
          visibleToPublic: true,
        },
      });

      const totalPages = Math.ceil(totalComments / pageSize);

      res.status(200).json({
        comments,
        totalComments,
        totalPages,
        currentPage,
      });
    } catch (error) {
      console.error("Error fetching comments with authors:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
