// pages/api/reply/hide.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { replyId } = req.body;

    // Validate request body
    if (!replyId || isNaN(Number(replyId))) {
      return res.status(400).json({ error: 'Invalid reply ID' });
    }

    // Verify the user is an ADMIN
    const user = verifyTokenMdw(req);
    if (!user || user.role !== "ADMIN") {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the reply exists
    const reply = await prisma.reply.findUnique({
      where: { id: Number(replyId) },
    });

    if (!reply) {
      return res.status(404).json({ error: 'reply not found' });
    }

    try {
      // Hide the reply
      await prisma.reply.update({
        where: { id: Number(replyId) },
        data: { visibleToPublic: false },
      });

      // Return success response
      return res.status(200).json({ message: 'Reply hidden successfully' });
    } catch (error) {
      console.error('Error hiding reply:', error);
      return res.status(500).json({ error: 'Failed to hide reply' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
