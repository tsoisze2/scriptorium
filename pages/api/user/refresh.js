import { generateToken, verifyTokenRefresh, verifyToken } from "@/utils/auth";
import prisma from "@/utils/db";

import jwt from "jsonwebtoken";
const JWT_SECRET_REFRESH = "burhasdkfjsafdasf1242458938w4e";

export default function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' }); // Handle other methods if needed
    }
  
    const { refreshToken } = req.body; // Expecting refresh token in the request body
  
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' }); // No refresh token provided
    }
  
    // Verify the refresh token
    jwt.verify(refreshToken, JWT_SECRET_REFRESH, (err, payload) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' }); // Invalid or expired token
      }
  
      // Generate a new access token with the same payload
      const user = prisma.user.findUnique({
        where: payload.username,
      });
      const newAccessToken = generateToken(user);
  
      // Return the new access token
      return res.status(200).json({ accessToken: newAccessToken });
    });
  }