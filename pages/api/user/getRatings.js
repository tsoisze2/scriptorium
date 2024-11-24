import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const user = { id: 3 };

    // Fetch ratings for blog posts
    const blogPostRatings = await prisma.ratingBlogPost.findMany({
      where: { authorId: user.id },
      include: {
        blogPost: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Fetch ratings for comments
    const commentRatings = await prisma.ratingComment.findMany({
      where: { authorId: user.id },
      include: {
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    return res.status(200).json( {blogPostRatings, commentRatings} );
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
