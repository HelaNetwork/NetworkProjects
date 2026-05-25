import { readFile } from "fs/promises";
import path from "path";

const agentSkillMap = {
  "user-agent": path.resolve(process.cwd(), "..", "agents", "user-agent", "skill.md"),
  "strategy-agent": path.resolve(process.cwd(), "..", "agents", "strategy-agent", "skill.md"),
} as const;

export type AgentSkillSlug = keyof typeof agentSkillMap;

export async function readAgentSkill(slug: AgentSkillSlug) {
  return readFile(agentSkillMap[slug], "utf8");
}
