import { readFile } from "node:fs/promises";
import YAML from "yaml";
import type { SkillDefinition } from "../../shared/types.js";

export async function loadSkill(skillPath: string): Promise<SkillDefinition> {
  const raw = await readFile(skillPath, "utf8");
  const parsed = YAML.parse(raw) as SkillDefinition;
  if (!parsed?.name || !Array.isArray(parsed.tools)) {
    throw new Error(`Invalid skill file: ${skillPath}`);
  }

  return parsed;
}

export async function loadPrompt(promptPath: string) {
  return readFile(promptPath, "utf8");
}
