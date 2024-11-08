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

  const { templateId } = req.body;

  // Verify templateId
  if (!templateId || isNaN(Number(templateId))) {
    return res.status(400).json({ error: 'Invalid or missing template ID' });
  }

  try {
    const template = await prisma.codeTemplate.findUnique({ where: { id: Number(templateId) } });

    if (!template) {
      return res.status(404).json({ error: "Code template not found" });
    }

    // Set the authorId 
    const loggedInUser = await prisma.user.findUnique({
      where: { username: user.username },
      select: { id: true },
    });

    const forkedTemplate = await prisma.codeTemplate.create({
      data: {
        title: `${template.title} (forked)`, 
        code: template.code,
        explanation: template.explanation,
        language: template.language,
        author: {
          connect: { id: loggedInUser.id }, // Link to the author by their ID
        },
      },
    });

    return res.status(201).json(forkedTemplate);
    
  } catch (error) {
    return res.status(500).json({ error: "Failed to fork template" });
  }
}
