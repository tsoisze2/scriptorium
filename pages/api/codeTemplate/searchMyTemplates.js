import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";
import { convertTagsToArray } from "@/utils/format";
import { pageSize } from "@/config";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { title, tags, content, language, page = 1} = req.body; // Extract query parameters


        // Verify the user making the request
        const user = verifyTokenMdw(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Validate page to be a number
        if (isNaN(Number(page))) {
            return res.status(400).json({ error: 'Invalid page number provided' });
        }

        const currentPage = Number(page);

        try {
            // Get the logged in user
            const loggedInUser = await prisma.user.findUnique({
                where: { username: user.username },
                select: { id: true },
            });

            // Build dynamic query filters based on which parameters are provided
            const searchConditions = {
                authorId: {
                    equals: loggedInUser.id,
                }
            };

            if (title) {
                searchConditions.title = {
                    contains: title,
                }
            }

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

            if (content) {
                searchConditions.OR = [
                    {
                        code: {
                            contains: content,
                        },
                    },
                    {
                        explanation: {
                            contains: content,
                        },
                    },
                ]
            }

            if (language) {
                searchConditions.language = {
                    equals: language,
                }
            }

            // Get the total count of matching templates
            const totalTemplates = await prisma.codeTemplate.count({
                where: searchConditions,
            });

            // Calculate pagination offsets
            const skip = (currentPage - 1) * pageSize; // Skip records for previous pages

            // Execute the query with pagination
            const templates = await prisma.codeTemplate.findMany({
                where: searchConditions,
                include: {
                    tags: true, // Include associated tags
                },
                skip: skip,
                take: pageSize, // Limit the number of results to pageSize
            });

            // Calculate total pages
            const totalPages = Math.ceil(totalTemplates / pageSize);

            // Send the paginated response
            res.status(200).json({
                templates,
                totalTemplates,
                totalPages,
                currentPage,
            });
        } catch (error) {
            console.error('Error searching templates:', error);
            res.status(500).json({ error: 'Internal server error' });
        }


    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}