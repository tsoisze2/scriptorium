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

  const { templateId } = req.query;

  try {
    const template = await prisma.codeTemplate.findUnique({ where: { id: templateId } });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    if (template.authorId !== user.id && !user.isAdmin) {
      return res.status(403).json({ error: "Permission denied" });
    }

    await prisma.codeTemplate.delete({ where: { id: templateId } });

    return res.status(200).json({ message: "Template deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete template" });
  }
}
