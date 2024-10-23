import prisma from "@/utils/db";
import { convertTagsToArray } from "@/utils/format";
import { pageSize } from "@/config";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { title, content, tags, codeTemplateId, page = 1 } = req.body; // Extract query parameters

        // Validate page number
        if (isNaN(Number(page))) {
            return res.status(400).json({ error: 'Invalid page number provided' });
        }

        const currentPage = Number(page);

        try {
            // Build dynamic query filters based on which parameters are provided
            const searchConditions = {};

            // Title condition (case-insensitive)
            if (title) {
                searchConditions.title = {
                    contains: title,
                }
            }

            // Content condition (search in both description and content)
            if (content) {
                searchConditions.OR = [
                    {
                        description: {
                            contains: content,
                        },
                    },
                    {
                        content: {
                            contains: content,
                        },
                    },
                ]
            }

            // Tags condition (search for posts with matching tags)
            if (tags) {
                const tagsArray = convertTagsToArray(tags);

                const tagConditions = tagsArray.map(tag => ({
                    tags: {
                        some: {
                            name: tag,
                        },
                    },
                }));

                searchConditions.AND = tagConditions;
            }

            // CodeTemplateId condition (search for posts linked to a specific codeTemplate by ID)
            if (codeTemplateId) {
                searchConditions.codeTemplateId = codeTemplateId; // Exact match on associated code template ID
            }

            // Get the total count of matching blog posts
            const totalBlogPosts = await prisma.blogPost.count({
                where: searchConditions,
            });

            // Calculate pagination offsets
            const skip = (currentPage - 1) * pageSize; // Skip records for previous pages

            // Execute the query with pagination
            const blogPosts = await prisma.blogPost.findMany({
                where: searchConditions,
                include: {
                    tags: true, // Include associated tags
                    codeTemplate: true, // Include associated code template
                    ratings: true, // Include ratings for sorting
                },
                skip: skip,
                take: pageSize, // Limit the number of results to pageSize
            });

            // Calculate total pages
            const totalPages = Math.ceil(totalBlogPosts / pageSize);

            // Send the paginated response
            res.status(200).json({
                blogPosts,
                totalBlogPosts,
                totalPages,
                currentPage,
            });
        } catch (error) {
            console.error('Error searching blog posts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}