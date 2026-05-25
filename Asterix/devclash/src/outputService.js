import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, "..", "output");
const outputFile = path.join(outputDir, "ai-output.txt");

export async function saveOutputToFile(output) {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.appendFile(outputFile, `${output}\n---\n`, "utf8");
  return outputFile;
}
