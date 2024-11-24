import prisma from "@/utils/db";
import { verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Verify the token from the Authorization header
      const user = verifyTokenMdw(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Fetch user details from the database
      const profile = await prisma.user.findUnique({
        where: { username: user.username },
        select: {
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNum: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
      });

      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
