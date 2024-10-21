import { exec } from "child_process";
import { verifyToken } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { language, code, input } = req.body;

  const commandMap = {
    "python": "python3",
    "javascript": "node",
    "java": "javac && java",
    "c": "gcc -o temp && ./temp",
    "cpp": "g++ -o temp && ./temp",
  };

  if (!commandMap[language]) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  const command = commandMap[language];
  const tempFileName = `temp.${language === "python" ? "py" : language === "javascript" ? "js" : language}`;

  try {
    exec(`${command} ${tempFileName}`, (error, stdout, stderr) => {
      if (error || stderr) {
        return res.status(500).json({ error: stderr || error.message });
      }
      return res.status(200).json({ output: stdout });
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to execute code" });
  }
}
