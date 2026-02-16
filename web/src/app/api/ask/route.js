import { spawn } from "child_process";
import path from "path";

export const runtime = "nodejs";

const pythonExecutable = process.env.PYTHON_EXECUTABLE || "python";

export async function POST(request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return Response.json({ error: "Query is required." }, { status: 400 });
    }

    const repoRoot = path.resolve(process.cwd(), "..");
    const script = [
      "from QueryProcessor import process_user_query",
      "import json,sys",
      "payload=json.loads(sys.stdin.read())",
      "answer,_=process_user_query(payload['query'])",
      "print(answer)",
    ].join("; ");

    const result = await runPython(repoRoot, script, JSON.stringify({ query }));
    return Response.json({ answer: result.trim() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function runPython(cwd, script, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(pythonExecutable, ["-c", script], { cwd });
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

    child.stdin.write(input);
    child.stdin.end();
  });
}
