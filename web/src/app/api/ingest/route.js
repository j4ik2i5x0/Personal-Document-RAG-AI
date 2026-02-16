import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";

export const runtime = "nodejs";

const pythonExecutable = process.env.PYTHON_EXECUTABLE || "python";

export async function POST(request) {
  const formData = await request.formData();
  const files = formData.getAll("files");

  if (!files.length) {
    return Response.json({ error: "No files uploaded." }, { status: 400 });
  }

  const repoRoot = path.resolve(process.cwd(), "..");
  let totalChunks = 0;

  try {
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const tempPath = await writeTempPdf(file.name, buffer);

      const output = await runPython(repoRoot, "dataprocessor.py", tempPath);
      if (output.includes("chunks:")) {
        const match = output.match(/chunks:(\d+)/i);
        if (match) totalChunks += Number(match[1]);
      }
    }
    return Response.json({ chunks: totalChunks || "indexed" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function writeTempPdf(originalName, buffer) {
  const suffix = path.extname(originalName) || ".pdf";
  const filename = `simplerag-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}${suffix}`;
  const tempPath = path.join(os.tmpdir(), filename);
  await fs.writeFile(tempPath, buffer);
  return tempPath;
}

function runPython(cwd, scriptPath, filePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(pythonExecutable, [scriptPath, filePath], { cwd });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || "Python process failed."));
      } else {
        resolve(stdout);
      }
    });
  });
}
