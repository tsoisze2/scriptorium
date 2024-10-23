import prisma from "@/utils/db";
import { pageSize } from "@/config";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { blogPostId, page = 1 } = req.body;

        // Validate page number
        if (isNaN(Number(page))) {
            return res.status(400).json({ error: 'Invalid page number provided' });
        }

        const currentPage = Number(page);

        // Verify this blogPost exists
        if (!blogPostId || isNaN(Number(blogPostId))) {
            return res.status(400).json({ error: "Missing or invalid blogPost ID" });
        }

        const blogPost = await prisma.blogPost.findUnique({
            where: { id: Number(blogPostId) },
            select: { id: true },
        });

        if (!blogPost) {
            return res.status(404).json({ error: "BlogPost not found" });
        }

        try {
            // Fetch comments related to the given blogPostId, including their ratings
            const comments = await prisma.comment.findMany({
                where: {
                    blogPostId: Number(blogPostId) // Get comments for a specific blog post
                },
                include: {
                    ratings: true, // Include ratings so we can calculate the score
                    replies: true  // Include replies 
                }
            });

            // Calculate the rating score (upvotes - downvotes) for each comment
            const sortedComments = comments
                .map(comment => {
                    const upvotes = comment.ratings.filter(rating => rating.upvote).length;
                    const downvotes = comment.ratings.length - upvotes;
                    const score = upvotes - downvotes;

                    return { ...comment, score };
                })
                .sort((a, b) => b.score - a.score); // Sort by score in descending order

            // Pagination
            const totalComments = sortedComments.length;
            const totalPages = Math.ceil(totalComments / pageSize);

            // Slice the array based on pagination
            const paginatedComments = sortedComments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

            // Send the paginated and sorted response
            res.status(200).json({
                comments: paginatedComments,
                totalComments,
                totalPages,
                currentPage
            });
        } catch (error) {
            console.error('Error fetching comments:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}