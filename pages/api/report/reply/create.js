// pages/api/report/reply/create.js

import prisma from "@/utils/db";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { content, authorId, replyId } = req.body;

        // Validate request body
        if (!content || !authorId || !replyId || isNaN(Number(authorId)) || isNaN(Number(replyId))) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate user

        // Validate replyId
        const replyExists = await prisma.reply.findUnique({
            where: { id: Number(replyId) },
        });
        if (!replyExists) {
            return res.status(404).json({ message: 'reply ID does not exist' });
        }

        try {
            // Create a new report
            const newReport = await prisma.reportReply.create({
                data: {
                    content: content,
                    author: {
                        connect: { id: Number(authorId) }, // Link to the author by their ID
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