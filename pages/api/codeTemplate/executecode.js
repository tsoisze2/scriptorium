// pages/api/executecode.js

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { highlight } from "highlight.js"; // for syntax highlighting

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, language, input } = req.body;

  const supportedLanguages = ["python", "javascript", "java", "c", "cpp"];
  if (!supportedLanguages.includes(language)) {
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  // Syntax highlighting
  const highlightedCode = highlight(language, code).value;

  // Set up file paths and commands for each language
  const fileExtension = language === "python" ? "py" : language === "javascript" ? "js" : language;
  const tempFileName = `temp.${fileExtension}`;
  const tempFilePath = path.join("/tmp", tempFileName);

  const commands = {
    python: `python3 ${tempFilePath}`,
    javascript: `node ${tempFilePath}`,
    java: `javac ${tempFileName} && java ${tempFileName.replace(".java", "")}`,
    c: `gcc ${tempFileName} -o temp.out && ./temp.out`,
    cpp: `g++ ${tempFileName} -o temp.out && ./temp.out`,
  };

  // Write code to a temporary file
  fs.writeFileSync(tempFilePath, code);

  try {
    // Run the command with the user's code and stdin (if provided)
    exec(commands[language], { input: input || "" }, (error, stdout, stderr) => {
      const response = {
        output: stdout || "",
        errors: stderr || (error ? error.message : ""),
        warnings: "", // Warnings can be parsed if necessary
        highlightedCode,
      };

      res.status(200).json(response);
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to execute code" });
  } finally {
    // Clean up: remove temp file
    fs.unlinkSync(tempFilePath);
  }
}
