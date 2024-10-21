import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { postId } = req.query;

  try {
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    if (post.authorId !== user.id && !user.isAdmin) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Delete associated comments, reports, ratings, etc.
    await prisma.comment.deleteMany({ where: { postId } });
    await prisma.report.deleteMany({ where: { postId } });
    await prisma.rating.deleteMany({ where: { postId } });

    await prisma.blogPost.delete({ where: { id: postId } });

    return res.status(200).json({ message: "Blog post deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete blog post" });
  }
}
