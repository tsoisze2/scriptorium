import prisma from "@/utils/db";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { codeTemplateId } = req.body; // Extract codeTemplateId from request body

        // Validate that the codeTemplateId is provided and is a number
        if (!codeTemplateId || isNaN(Number(codeTemplateId))) {
            return res.status(400).json({ error: 'Invalid or missing codeTemplateId' });
        }

        try {
            // Check if the codeTemplateId is valid by finding the code template
            const codeTemplate = await prisma.codeTemplate.findUnique({
                where: { id: Number(codeTemplateId) },
            });

            if (!codeTemplate) {
                return res.status(404).json({ error: 'Code template not found' });
            }

            // Fetch all blog posts associated with this code template
            const blogPosts = await prisma.blogPost.findMany({
                where: { codeTemplateId: Number(codeTemplateId) },
                include: {
                    tags: true, // Optionally include associated tags
                    author: {
                        select: {
                            username: true, // Include author details if needed
                        }
                    },
                },
            });

            // Return the list of blog posts associated with the code template
            res.status(200).json({
                blogPosts,
            });
        } catch (error) {
            console.error('Error fetching blog posts for code template:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}