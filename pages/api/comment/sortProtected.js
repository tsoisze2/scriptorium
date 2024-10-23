// Sort all reported comments based on their total number of reports received
import prisma from "@/utils/db";
import { pageSize } from "@/config";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
    if (req.method === 'POST') {

        // Validate user
        const user = verifyTokenMdw(req);
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden: You are not an ADMIN. Log in as ADMIN if you want to continue" });
        }
        
        const { page = 1 } = req.body; // Extract page from request body

        // Validate page number
        if (isNaN(Number(page))) {
            return res.status(400).json({ error: 'Invalid page number provided' });
        }

        const currentPage = Number(page);

        try {
            // Fetch comments that have at least one report
            const comments = await prisma.comment.findMany({
                where: {
                    reports: {
                        some: {}, // This ensures that only comments with at least one report are included
                    },
                },
                include: {
                    reports: true, // Include reports to calculate the total number of reports
                },
            });

            // Calculate the total number of reports for each comment
            const sortedComments = comments
                .map(comment => {
                    const reportCount = comment.reports.length; // Count the number of reports
                    return { ...comment, reportCount };
                })
                .sort((a, b) => b.reportCount - a.reportCount); // Sort by number of reports in descending order

            // Apply pagination after sorting
            const paginatedComments = sortedComments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

            // Send the paginated response
            res.status(200).json({
                comments: paginatedComments,
                totalComments: comments.length, // Total number of comments before pagination
                totalPages: Math.ceil(comments.length / pageSize), // Total number of pages
                currentPage,
            });
        } catch (error) {
            console.error('Error fetching comments:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}