import { PrismaClient } from "@prisma/client";
import { verifyTokenMdw } from "@/utils/auth";  

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = verifyTokenMdw(req); 

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { title, description, tags } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  try {
    const post = await prisma.blogPost.create({
      data: {
        title,
        description,
        tags,
        author: {
          connect: { username: user.username }, 
        },
      },
    });
    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create blog post" });
  }
}
