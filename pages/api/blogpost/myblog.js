import prisma from "@/utils/db"; // Connection to Prisma
import { verifyTokenMdw } from "@/utils/auth"; // Middleware for token verification
import { pageSize } from "@/config";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const user = verifyTokenMdw(req); // Get the logged-in user details
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { page = 1 } = req.body; // Pagination parameter
      const currentPage = Number(page);

      // Fetch all blog posts where the author matches the logged-in user
      const totalBlogPosts = await prisma.blogPost.count({
        where: { author: { username: user.username } },
      });

      const blogPosts = await prisma.blogPost.findMany({
        where: { author: { username: user.username } },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        include: {
          tags: true, // Include associated tags
        },
      });

      return res.status(200).json({
        blogPosts,
        totalBlogPosts,
        totalPages: Math.ceil(totalBlogPosts / pageSize),
        currentPage,
      });
    } catch (error) {
      console.error("Error fetching user's blog posts:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
