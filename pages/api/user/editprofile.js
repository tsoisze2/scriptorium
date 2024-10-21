import prisma from "@/utils/db";
import { isValidEmail, isValidPhoneNumber, isValidPassword, isValidName, isValidUrl } from "@/utils/validation";
import { hashPassword, verifyTokenMdw } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    const { firstName, lastName, email, phoneNum, password, avatarUrl } = req.body;
    if (!firstName && !lastName && !email && !phoneNum && !password && !avatarUrl) {
      return res.status(400).json({ error: "Please provide at least one field to update" })
    }

    // Validate user (logged in)
    const user = verifyTokenMdw(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate first name and last name
    if (firstName && !isValidName(firstName)) {
      return res.status(400).json({ error: "First name must be between 2 and 50 characters" });
    }
    if (lastName && !isValidName(lastName)) {
      return res.status(400).json({ error: "Last name must be between 2 and 50 characters" });
    }

    // Validate email
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate phone number (optional)
    if (phoneNum && !isValidPhoneNumber(phoneNum)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    // Validate password (optional)
    if (password && !isValidPassword(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    // Validate avatar URL (optional)
    if (avatarUrl && !isValidUrl(avatarUrl)) {
      return res.status(400).json({ error: "Invalid avatar URL" });
    }

    // Check if the email already exists
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email: email },
      });
      if (existingUser) {
        return res.status(409).json({ error: "Email already taken" });
      }
    }

    // Prepare data to update
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phoneNum) updateData.phoneNum = phoneNum;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    // If password is provided, hash it before updating
    if (password) {
      const hashedPassword = await hashPassword(password);
      updateData.password = hashedPassword;
    }

    try {
      // Update the user profile in the database
      const updatedUser = await prisma.user.update({
        where: { username: user.username }, // Identifying the user by username
        data: updateData,
        select: {
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNum: true,
          avatarUrl: true,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
