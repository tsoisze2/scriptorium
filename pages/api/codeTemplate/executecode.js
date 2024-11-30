import { exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { promisify } from 'util';

const ep = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, language, stdin } = req.body;

  const validLang = [
    'python', 'javascript', 'java', 'c', 'cpp', 'ruby', 'go', 'php', 'swift', 'kotlin', 'r', 'rust'
  ];
  if (!validLang.includes(language)) {
    return res.status(400).json({ error: 'Language not supported' });
  }

  const tempDir = path.join(process.cwd(), 'temp');
  await fs.ensureDir(tempDir);

  const codefp = path.join(tempDir, `main${getExt(language)}`);
  const infp = path.join(tempDir, 'input.txt');

  await fs.writeFile(codefp, code);

  await fs.writeFile(infp, stdin || '');

  try {
    const command = getDockerCommand(language, codefp, infp);

    const { stdout, stderr } = await ep(command, { timeout: 10000, maxBuffer: 1024 * 1024 });

    if (stderr) {
      return res.status(200).json({ output: '', error: stderr });
    }

    res.status(200).json({ output: stdout, error: '' });
  } catch (error) {
    if (error.killed || error.signal === 'SIGTERM') {
      return res.status(500).json({ error: 'Execution timed out' });
    }

    res.status(400).json({ output: '', error: 'Error', details: error.message });
  } finally {
    try {
      await fs.remove(tempDir);
    } catch (cleanErr) {
      console.error('Failed cleanup:', cleanErr);
    }
  }
}

// get file extension
function getExt(lang) {
  const ext = {
    python: '.py',
    javascript: '.js',
    java: '.java',
    c: '.c',
    cpp: '.cpp',
    ruby: '.rb',
    go: '.go',
    php: '.php',
    swift: '.swift',
    kotlin: '.kt',
    r: '.r',
    rust: '.rs',
  };

  return ext[lang];
}

function getDockerCommand(lang, codefp, infp) {
  const commands = {
    python: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app python:3 bash -c "python main.py < input.txt"`,
    javascript: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app node:16 bash -c "node main.js < input.txt"`,
    java: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app openjdk:17 bash -c "javac Main.java && java Main < input.txt"`,
    c: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app gcc:11 bash -c "gcc main.c -o program && ./program < input.txt"`,
    cpp: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app gcc:11 bash -c "g++ main.cpp -o program && ./program < input.txt"`,
    ruby: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app ruby:3 bash -c "ruby main.rb < input.txt"`,
    go: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app golang:1.18 bash -c "go run main.go < input.txt"`,
    php: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app php:8 bash -c "php main.php < input.txt"`,
    swift: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app swift:5 bash -c "swift main.swift < input.txt"`,
    kotlin: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app kotlin:latest bash -c "kotlinc main.kt -include-runtime -d main.jar && java -jar main.jar < input.txt"`,
    r: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app r-base:latest bash -c "Rscript main.r < input.txt"`,
    rust: `docker run --rm -v ${path.dirname(codefp)}:/app -w /app rust:latest bash -c "rustc main.rs && ./main < input.txt"`,
  };

  if (!commands[lang]) {
    throw new Error(`${lang} is not supported.`);
  }

  return commands[lang];
}