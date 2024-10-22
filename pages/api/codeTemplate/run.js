import { exec } from "child_process";
import { verifyTokenMdw } from "@/utils/auth";  
import fs from 'fs';  // Import file system module
import path from 'path';  // Import path module for file handling

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = verifyTokenMdw(req);  

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { language, code } = req.body;

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

  // Define the file extension based on the language
  const fileExtension = language === "python" ? "py" : language === "javascript" ? "js" : language;
  const tempFileName = `temp.${fileExtension}`;
  const tempFilePath = path.join(__dirname, tempFileName);

  // Write the user's code to a temporary file
  fs.writeFileSync(tempFilePath, code);

  const command = commandMap[language];

  try {
    // Execute the code using the specific command for the language
    exec(`${command} ${tempFileName}`, (error, stdout, stderr) => {
      if (error || stderr) {
        return res.status(500).json({ error: stderr || error.message });
      }
      return res.status(200).json({ output: stdout });
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to execute code" });
  } finally {
    // Clean up: remove the temp file after execution
    fs.unlinkSync(tempFilePath);
  }
}
