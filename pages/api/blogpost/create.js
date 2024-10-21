import { PrismaClient } from "@prisma/client";
import { verifyTokenMdw } from "@/utils/auth";  

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Allow only POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify the user token and retrieve the user
  const user = verifyTokenMdw(req); 

  // If token verification fails, return unauthorized error
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Destructure request body to extract title, description, tags (as a string), and content
  const { title, description, tags, content } = req.body;

  // Check if essential fields are provided
  if (!title || !description || !content) {
    return res.status(400).json({ error: "Title, description, and content are required" });
  }

  // Ensure that the tag is a string and trim any extra spaces
  const singleTag = tags ? tags.trim() : '';

  try {
    // Create a new blog post with Prisma
    const post = await prisma.blogPost.create({
      data: {
        title,
        description,
        content,
        author: {
          connect: { username: user.username },  // Connect the post to the existing user by username
        },
        tags: {
          connectOrCreate: {
            where: { name: singleTag },  // Check if the single tag exists
            create: { name: singleTag }  // Create the tag if it doesn't exist
          },
        },
      },
    });

    // Respond with success and the created post data
    return res.status(201).json({ message: "Post created successfully", post });

  } catch (error) {
    // Handle any errors that occur during the post creation process
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}