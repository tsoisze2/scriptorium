// pages/api/report/comment/create.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { content, commentId } = req.body;

        // Validate request body
        if (!content || !commentId || isNaN(Number(commentId))) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate user
        const user = verifyTokenMdw(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Validate commentId
        const commentExists = await prisma.comment.findUnique({
            where: { id: Number(commentId) },
        });
        if (!commentExists) {
            return res.status(404).json({ message: 'comment ID does not exist' });
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
            const newReport = await prisma.reportComment.create({
                data: {
                    content: content,
                    author: {
                        connect: { id: loggedInUser.id }, // Link to the author by their ID
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