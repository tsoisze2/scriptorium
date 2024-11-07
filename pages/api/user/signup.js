// pages/api/user/signup.js
import prisma from "@/utils/db";
import { isValidEmail, isValidPhoneNumber, isValidPassword, isValidName } from "@/utils/validation";
import { hashPassword } from "@/utils/auth";

const BCRYPT_SALT_ROUNDS = 10;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password, firstName, lastName, email, phoneNum, inviteCode } = req.body;

    // Basic validation
    if (!username || !password || !firstName || !lastName || !isValidEmail(email)) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }
    if (!isValidName(firstName) || !isValidName(lastName)) {
      return res.status(400).json({ error: "First name and last name has to have between 2 to 50 characters" })
    }
    if (phoneNum && !isValidPhoneNumber(phoneNum)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: "Password has to have at least 8 characters" });
    }

    try {
      // Check if the username or email already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        return res.status(409).json({ error: "Username or email already taken" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(password)

      // Default role is 'USER'
      let role = 'USER';

      // Check invite code
      if (inviteCode) {
        const invite = await prisma.inviteCode.findUnique({
          where: { code: inviteCode },
        });

        if (invite && invite.isValid) {
          role = 'ADMIN'; // Set role to 'ADMIN' if invite code is valid

          // Mark invite code as used (invalidate it)
          await prisma.inviteCode.update({
            where: { code: inviteCode },
            data: { isValid: false },
          });
        } else {
          return res.status(400).json({ error: "Invalid invite code" });
        }
      }

      // Create the new user
      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          firstName,
          lastName,
          email,
          phoneNum,
          role, // Set role based on invite code
        },
      });

      return res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
