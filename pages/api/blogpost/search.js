import prisma from "@/utils/db";
import { convertTagsToArray } from "@/utils/format";
import { pageSize } from "@/config";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { title, content, tags, codeTemplateId, author, page = 1 } = req.body; // Extract query parameters

        // Validate page number
        if (isNaN(Number(page))) {
            return res.status(400).json({ error: 'Invalid page number provided' });
        }

        // Validate codeTemplateId
        if (codeTemplateId && isNaN(Number(codeTemplateId))) {
            return res.status(400).json({ error: 'Invalid codeTemplateId provided' });
        }

        const currentPage = Number(page);

        try {
            // Build dynamic query filters based on which parameters are provided
            const searchConditions = {
                visibleToPublic: true, // Ensure only public blog posts are returned
            };

            // Title condition (case-insensitive)
            if (title) {
                searchConditions.title = {
                    contains: title,
                };
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
                ];
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
                searchConditions.codeTemplateId = Number(codeTemplateId); // Exact match on associated code template ID
            }


            // Get the total count of matching blog posts
            const totalBlogPosts = await prisma.blogPost.count({
                where: searchConditions,
            });

            // Calculate pagination offsets
            const skip = (currentPage - 1) * pageSize; // Skip records for previous pages

            // Execute the query to fetch all matching blog posts (without pagination yet)
            const blogPosts = await prisma.blogPost.findMany({
                where: searchConditions,
                include: {
                    tags: true, // Include associated tags
                    codeTemplate: true, // Include associated code template
                    ratings: true, // Include associated ratings to calculate the score
                    author: true, // Include author details
                },
            });

            // Calculate the rating score (upvotes - downvotes) for each blog post
            const sortedBlogPosts = blogPosts
                .map(post => {
                    const upvotes = post.ratings.filter(rating => rating.upvote).length;
                    const downvotes = post.ratings.length - upvotes;
                    const score = upvotes - downvotes;

                    return { ...post, score };
                })
                .sort((a, b) => b.score - a.score); // Sort by score in descending order

            // Now apply pagination after sorting
            const paginatedBlogPosts = sortedBlogPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

            // Send the paginated response
            res.status(200).json({
                blogPosts: paginatedBlogPosts,
                totalBlogPosts: totalBlogPosts, // Total number of posts before pagination
                totalPages: Math.ceil(totalBlogPosts / pageSize), // Total number of pages
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
