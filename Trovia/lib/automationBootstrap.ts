import { Wallet } from "ethers";
import { fetchAgentById } from "./contracts";
import { parseConfigSchema } from "./agentUi";
import { getStoredAgent, upsertStoredAgent } from "./automationStore";
import type { AgentField, AgentObject, StoredAgent } from "../types/agent";

const TEMPLATE_AUTOMATION_PLACEHOLDER = "__TEMPLATE_AUTOMATION_PLACEHOLDER__";

function toFieldType(inputType: string): AgentField["type"] {
  if (inputType === "number") {
    return "number";
  }
  if (inputType === "select") {
    return "select";
  }
  return "text";
}

function toAgentObject(agent: Awaited<ReturnType<typeof fetchAgentById>>): AgentObject {
  const fields = parseConfigSchema(agent.configSchema).map((field) => ({
    key: field.key,
    label: field.label,
    type: toFieldType(field.inputType),
    required: true,
    options: field.options,
    placeholder: field.placeholder
  }));

  return {
    name: agent.name,
    description: agent.description,
    agentType: agent.agentType as AgentObject["agentType"],
    priceHLUSD: Number(agent.priceHLUSD),
    configSchema: { fields },
    executionLogic: "Template automation fallback",
    geminiPrompt: "",
    tags: [agent.agentType],
    estimatedRuntime: "30s"
  };
}

function buildPlaceholderExecutionCode(agentType: string) {
  return [
    "// " + TEMPLATE_AUTOMATION_PLACEHOLDER,
    "async function executeAgent(config) {",
    `  return { success: true, result: "Template ${agentType} automation executed.", data: config };`,
    "}"
  ].join("\n");
}

export function isTemplateAutomationPlaceholder(executionCode: string) {
  return executionCode.includes(TEMPLATE_AUTOMATION_PLACEHOLDER);
}

export async function ensureStoredAgentForAutomation(agentId: string): Promise<StoredAgent> {
  const existing = await getStoredAgent(agentId);
  if (existing) {
    return existing;
  }

  const chainAgent = await fetchAgentById(Number(agentId));
  const agentWallet = Wallet.createRandom();

  const record: StoredAgent = {
    agent: toAgentObject(chainAgent),
    executionCode: buildPlaceholderExecutionCode(chainAgent.agentType),
    deployedAt: new Date().toISOString(),
    developerAddress: chainAgent.developer,
    agentId,
    agentWalletAddress: agentWallet.address,
    agentWalletPrivateKey: agentWallet.privateKey,
    status: "active"
  };

  await upsertStoredAgent(record);
  return record;
}
