// pages/api/report/reply/create.js

import prisma from "@/utils/db";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { content, replyId } = req.body;

        // Validate request body
        if (!content || !replyId || isNaN(Number(replyId))) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate user
        const user = verifyTokenMdw(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Validate replyId
        const replyExists = await prisma.reply.findUnique({
            where: { id: Number(replyId) },
        });
        if (!replyExists) {
            return res.status(404).json({ message: 'reply ID does not exist' });
        }

        try {
            // Set the authorId 
            const loggedInUser = await prisma.user.findUnique({
                where: { username: user.username },
                select: { id: true },
            });
            if (!loggedInUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Create a new report
            const newReport = await prisma.reportReply.create({
                data: {
                    content: content,
                    author: {
                        connect: { id: loggedInUser.id }, // Link to the author by their ID
                    },
                    reply: {
                        connect: { id: Number(replyId) }, // Link to the comment by its ID
                    },
                },
            });

            // Return the newly created report
            return res.status(201).json(newReport);
        } catch (error) {
            console.error('Error creating report:', error);
            return res.status(500).json({ error: 'Failed to create report' });
        }
    } else {
        // Handle other HTTP methods
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}