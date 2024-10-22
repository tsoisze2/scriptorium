// pages/api/codeTemplate/delete.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth"; 

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { codeTemplateId } = req.body; 

    // Validate codeTemplate ID
    if (!codeTemplateId || isNaN(Number(codeTemplateId))) {
      return res.status(400).json({ error: 'Invalid or missing codeTemplate ID' });
    }

    // Verify the user making the request
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Fetch the codeTemplate to ensure it exists and check the author
      const codeTemplate = await prisma.codeTemplate.findUnique({
        where: { id: Number(codeTemplateId) },
        select: { authorId: true }, // Only need the authorId to compare
      });

      if (!codeTemplate) {
        return res.status(404).json({ error: 'codeTemplate not found' });
      }

      // Check if the logged-in user is the author of the codeTemplate
      const loggedInUser = await prisma.user.findUnique({
        where: { username: user.username },
        select: { id: true },
      });
      if (codeTemplate.authorId !== loggedInUser.id) {
        return res.status(403).json({ error: 'You are not the author of this codeTemplate' });
      }

      // Set the codeTemplate field of all blogPosts of this codeTemplate to null
      await prisma.blogPost.updateMany({
        where: { codeTemplateId: Number(codeTemplateId) },
        data: { codeTemplateId: null },
      });

      // Delete the codeTemplate itself
      await prisma.codeTemplate.delete({
        where: { id: Number(codeTemplateId) },
      });

      return res.status(200).json({ message: 'CodeTemplate deleted successfully' });
    } catch (error) {
      console.error('Error deleting codeTemplate:', error);
      return res.status(500).json({ error: 'Failed to delete codeTemplate' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
