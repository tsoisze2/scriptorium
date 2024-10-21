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

  const { templateId } = req.query;

  try {
    const template = await prisma.codeTemplate.findUnique({ where: { id: templateId } });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const forkedTemplate = await prisma.codeTemplate.create({
      data: {
        title: `${template.title} (forked)`,
        explanation: template.explanation,
        tags: template.tags,
        code: template.code,
        language: template.language,
        authorId: user.id,
      },
    });

    return res.status(201).json(forkedTemplate);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fork template" });
  }
}
