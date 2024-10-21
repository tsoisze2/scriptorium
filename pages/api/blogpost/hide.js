import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  const user = verifyToken(token);

  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const { postId } = req.query;

  try {
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    await prisma.blogPost.update({
      where: { id: postId },
      data: { isHidden: true },
    });

    return res.status(200).json({ message: "Blog post hidden" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to hide blog post" });
  }
}
