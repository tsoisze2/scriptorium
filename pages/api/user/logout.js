export default async function handler(req, res) {
    if (req.method === 'POST') {
      // JWT is stored client-side, often in localStorage
      res.status(200).json({ message: 'Logout successful' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }
  