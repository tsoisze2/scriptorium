// pages/api/report/comment/create.js

import prisma from "@/utils/db";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { content, authorId, commentId } = req.body;

        // Validate request body
        if (!content || !authorId || !commentId || isNaN(Number(authorId)) || isNaN(Number(commentId))) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate user

        // Validate commentId
        const commentExists = await prisma.comment.findUnique({
            where: { id: Number(commentId) },
        });
        if (!commentExists) {
            return res.status(404).json({ message: 'comment ID does not exist' });
        }

        try {
            // Create a new report
            const newReport = await prisma.reportComment.create({
                data: {
                    content: content,
                    author: {
                        connect: { id: Number(authorId) }, // Link to the author by their ID
                    },
                    comment: {
                        connect: { id: Number(commentId) }, // Link to the comment by its ID
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