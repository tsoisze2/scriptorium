import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/auth";  

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { title, explanation, tags, code, language } = req.body;

  if (!title || !code || !language) {
    return res.status(400).json({ error: "Title, code, and language are required" });
  }

  try {
    const template = await prisma.codeTemplate.create({
      data: {
        title,
        explanation,
        tags,
        code,
        language,
        authorId: user.id,
      },
    });
    return res.status(201).json(template);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create template" });
  }
}
