// pages/api/reply/delete.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { replyId } = req.body;

    // Validate request body
    if (!replyId || isNaN(Number(replyId))) {
      return res.status(400).json({ error: 'Invalid reply ID' });
    }

    // Verify the user is authenticated
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the user by username to get their id
    const loggedInUser = await prisma.user.findUnique({
      where: { username: user.username },
      select: { id: true },
    });

    if (!loggedInUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the reply to check if the logged-in user is the author
    const reply = await prisma.reply.findUnique({
      where: { id: Number(replyId) },
      select: {
        authorId: true,
      },
    });

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Check if the logged-in user is the author of the reply
    if (reply.authorId !== loggedInUser.id) {
      return res.status(403).json({ error: 'You are not the author of this reply' });
    }

    try {
      // Update related replies' `replyingToId` to null
      await prisma.reply.updateMany({
        where: { replyingToId: Number(replyId) },
        data: { replyingToId: null },
      });

      // Delete the reply itself
      await prisma.reply.delete({
        where: { id: Number(replyId) },
      });

      // Return success response
      return res.status(200).json({ message: 'Reply deleted successfully' });
    } catch (error) {
      console.error('Error deleting reply:', error);
      return res.status(500).json({ error: 'Failed to delete reply' });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
