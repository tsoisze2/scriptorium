// Sort all reported blog posts based on their total number of reports received
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
            // Fetch blog posts including their reports
            const blogPosts = await prisma.blogPost.findMany({
                where: {
                    reports: {
                        some: {}, // This ensures that only blogPosts with at least one report are included
                    },
                },
                include: {
                    reports: true, // Include reports to calculate the total number of reports
                },
            });

            // Calculate the total number of reports for each blog post
            const sortedBlogPosts = blogPosts
                .map(post => {
                    const reportCount = post.reports.length; // Count the number of reports
                    return { ...post, reportCount };
                })
                .sort((a, b) => b.reportCount - a.reportCount); // Sort by number of reports in descending order

            // Apply pagination after sorting
            const paginatedBlogPosts = sortedBlogPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

            // Send the paginated response
            res.status(200).json({
                blogPosts: paginatedBlogPosts,
                totalBlogPosts: blogPosts.length, // Total number of posts before pagination
                totalPages: Math.ceil(blogPosts.length / pageSize), // Total number of pages
                currentPage,
            });
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}