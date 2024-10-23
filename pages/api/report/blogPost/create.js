// pages/api/report/blogPost/create.js

import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { content, blogPostId } = req.body;

        // Validate request body
        if (!content || !blogPostId || isNaN(Number(blogPostId))) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate user
        const user = verifyTokenMdw(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Validate blogPostId
        const blogPostExists = await prisma.blogPost.findUnique({
            where: { id: Number(blogPostId) },
        });
        if (!blogPostExists) {
            return res.status(404).json({ message: 'blogPost ID does not exist' });
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

            // Check if the user has already reported this blog post
            const existingReport = await prisma.reportBlogPost.findFirst({
                where: {
                    authorId: loggedInUser.id,
                    blogPostId: Number(blogPostId),
                },
            });

            if (existingReport) {
                return res.status(409).json({ error: 'You have already reported this blog post' });
            }

            // Create a new report
            const newReport = await prisma.reportBlogPost.create({
                data: {
                    content: content,
                    author: {
                        connect: { id: loggedInUser.id }, // Link to the author by their ID
                    },
                    blogPost: {
                        connect: { id: Number(blogPostId) }, // Link to the comment by its ID
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
