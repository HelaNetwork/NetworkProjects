import path from "node:path";
import { encodeFunctionData, parseAbi } from "viem";
import type {
  Address,
  AgentContextState,
  AgentRegistration,
  ExecutionApproval,
  MarketSnapshot,
  SkillDefinition,
  StrategyProposal,
} from "../../shared/types.js";
import {
  buildAaveWethSupplyProtocolPlan,
  buildAaveWethWithdrawProtocolPlan,
} from "../../shared/aave.js";
import {
  buildAaveSupplyCalls,
  buildAaveWithdrawCalls,
  signExecutionApproval,
} from "../../shared/viem-client.js";
import { callTool, type AgentPaymentOverrides } from "./mcp-client.js";
import { loadPrompt, loadSkill } from "./skill-loader.js";

interface AgentRuntimeConfig {
  agentId: string;
  agentType: "strategy" | "user";
  agentAddress: Address;
  vault: string;
  skillPath: string;
  promptPath: string;
  paymentConfig?: AgentPaymentOverrides;
}

export class SkillDrivenAgent {
  private readonly state: AgentContextState = {};
  private skill!: SkillDefinition;
  private prompt!: string;

  constructor(private readonly config: AgentRuntimeConfig) {}

  async boot() {
    this.skill = await loadSkill(this.config.skillPath);
    this.prompt = await loadPrompt(this.config.promptPath);
  }

  async act() {
    if (!this.skill || !this.prompt) {
      await this.boot();
    }

    const nextTool = this.selectNextTool();
    if (!nextTool) {
      return {
        agentId: this.config.agentId,
        complete: true,
        state: this.state,
      };
    }

    if (nextTool === "mock_market_data") {
      this.state.marketSnapshot = buildMockMarketData();
      return {
        agentId: this.config.agentId,
        action: "mock_market_data",
        result: this.state.marketSnapshot,
      };
    }

    const result = await this.invoke(nextTool);
    return {
      agentId: this.config.agentId,
      action: nextTool,
      result,
      complete: this.isComplete(),
    };
  }

  private selectNextTool() {
    const available = new Set(this.skill.tools);
    const prompt = this.prompt.toLowerCase();

    const scored = [
      this.score("register_agent", available.has("register_agent") && !this.state.registered ? 100 : 0),
      this.score(
        "get_reputation",
        available.has("get_reputation") && !this.state.reputation ? 90 + (prompt.includes("maximize reputation") ? 5 : 0) : 0,
      ),
      this.score("mock_market_data", this.config.agentType === "strategy" && !this.state.marketSnapshot ? 88 : 0),
      this.score(
        "submit_proposal",
        available.has("submit_proposal") &&
          Boolean(this.state.registered && this.state.reputation && this.state.marketSnapshot && !this.state.proposal)
          ? 95
          : 0,
      ),
      this.score("get_proposals", available.has("get_proposals") && !this.state.proposals ? 100 : 0),
      this.score(
        "get_vault_balance",
        available.has("get_vault_balance") &&
          this.config.agentType === "user" &&
          this.state.proposals &&
          this.state.proposals.length > 0 &&
          this.state.vaultBalance === undefined
          ? 70
          : 0,
      ),
      this.score(
        "submit_execution",
        available.has("submit_execution") &&
          this.config.agentType === "user" &&
          this.state.selectedProposal &&
          !this.state.execution
          ? 98
          : 0,
      ),
    ].sort((a, b) => b.score - a.score);

    return scored[0]?.score ? scored[0].name : undefined;
  }

  private async invoke(toolName: string) {
    switch (toolName) {
      case "register_agent": {
        const body = {
          agentId: this.config.agentId,
          agentType: this.config.agentType,
          agentAddress: this.config.agentAddress,
          skills: this.skill.tools,
          description: this.skill.description,
        };
        const result = await callTool<typeof body, { registration: AgentRegistration }>(
          toolName,
          this.config.agentId,
          body,
        );
        this.state.registered = true;
        return result;
      }
      case "get_reputation": {
        const result = await callTool<{ agentAddress: Address }, AgentContextState["reputation"]>(
          toolName,
          this.config.agentId,
          { agentAddress: this.config.agentAddress },
        );
        this.state.reputation = result;
        return result;
      }
      case "submit_proposal": {
        const wantsWithdraw = this.prompt.toLowerCase().includes("withdraw") || this.skill.description.toLowerCase().includes("withdraw");
        const protocolPlan = wantsWithdraw
          ? buildAaveWethWithdrawProtocolPlan()
          : buildAaveWethSupplyProtocolPlan();
        const proposalBody = {
          vault: this.config.vault,
          proposerAgentId: this.config.agentId,
          proposerAddress: this.config.agentAddress,
          title: wantsWithdraw
            ? "Withdraw vault WETH from Aave V3 on Base Sepolia"
            : "Supply vault WETH into Aave V3 on Base Sepolia",
          summary: wantsWithdraw
            ? "Pull the vault's WETH back from the live Aave V3 reserve using the vault itself as the owner."
            : "Move idle vault WETH into the live Aave V3 reserve using the vault itself as the liquidity owner.",
          rationale:
            wantsWithdraw
              ? "This proposal targets a real supported protocol. The agent prepares Aave-compatible withdraw calldata and the relayer executes the vault's WETH exit from Aave."
              : "This proposal targets a real supported protocol. The agent prepares Aave-compatible calldata and the relayer binds the final amount from the vault's live WETH balance before execution.",
          expectedApyBps: this.state.marketSnapshot?.supplyAprBps ?? 650,
          riskLevel: "low" as const,
          marketSnapshot: this.state.marketSnapshot ?? buildMockMarketData(),
          protocolPlan,
          calls: wantsWithdraw
            ? buildAaveWithdrawCalls({
                vault: this.config.vault as Address,
                poolAddress: protocolPlan.poolAddress,
                assetAddress: protocolPlan.assetAddress,
              })
            : buildAaveSupplyCalls({
                vault: this.config.vault as Address,
                poolAddress: protocolPlan.poolAddress,
                assetAddress: protocolPlan.assetAddress,
                amount: 0n,
                referralCode: protocolPlan.referralCode,
              }),
        };

        const result = await callTool<typeof proposalBody, { proposal: StrategyProposal }>(
          toolName,
          this.config.agentId,
          proposalBody,
          {
            x402Network: this.config.paymentConfig?.x402Network ?? this.skill.x402?.network,
            x402Signer: this.config.paymentConfig?.x402Signer ?? this.skill.x402?.signer,
          },
        );
        this.state.proposal = result.proposal;
        return result;
      }
      case "get_proposals": {
        const result = await callTool<{ vault: string }, { proposals: StrategyProposal[] }>(
          toolName,
          this.config.agentId,
          { vault: this.config.vault },
        );
        this.state.proposals = result.proposals;
        this.state.selectedProposal = [...result.proposals].sort(sortProposal)[0];
        return result;
      }
      case "get_vault_balance": {
        const proposal = this.state.selectedProposal;
        if (!proposal) {
          throw new Error("No selected proposal for vault balance lookup.");
        }

        const result = await callTool<{ vault: string; assetAddress?: Address }, { balance: string }>(
          toolName,
          this.config.agentId,
          { vault: proposal.vault, assetAddress: proposal.protocolPlan.assetAddress },
        );
        this.state.vaultBalance = BigInt(result.balance);
        return result;
      }
      case "submit_execution": {
        const selected = this.state.selectedProposal;
        if (!selected) {
          throw new Error("No proposal selected for execution.");
        }

        const approval = await this.buildApproval(selected);
        this.state.approval = approval;

        const body = {
          vault: selected.vault,
          proposalId: selected.id,
          userAgentId: this.config.agentId,
          approval: {
            ...approval,
            nonce: approval.nonce.toString(),
            deadline: approval.deadline.toString(),
          },
        };

        const result = await callTool<typeof body, AgentContextState["execution"]>(
          toolName,
          this.config.agentId,
          body,
        );
        this.state.execution = result;
        return result;
      }
      default:
        throw new Error(`Unsupported tool: ${toolName}`);
    }
  }

  private async buildApproval(proposal: StrategyProposal): Promise<ExecutionApproval> {
    return signExecutionApproval({
      vault: proposal.vault,
      proposalId: proposal.id,
      signer: this.config.agentAddress,
    });
  }

  private isComplete() {
    return this.config.agentType === "strategy" ? Boolean(this.state.proposal) : Boolean(this.state.execution);
  }

  private score(name: string, score: number) {
    return { name, score };
  }
}

export async function runAgentToCompletion(agent: SkillDrivenAgent, maxSteps = 8) {
  const transcript: unknown[] = [];

  for (let step = 0; step < maxSteps; step += 1) {
    const result = await agent.act();
    transcript.push(result);
    if ("complete" in result && result.complete) {
      return transcript;
    }
  }

  return transcript;
}

function buildMockMarketData(): MarketSnapshot {
  return {
    protocol: "AaveV3BaseSepolia",
    pair: "WETH",
    supplyAprBps: 520,
    borrowAprBps: 690,
    utilizationBps: 6800,
    confidence: 0.89,
    source: "mock-feed",
    timestamp: new Date().toISOString(),
  };
}

function sortProposal(a: StrategyProposal, b: StrategyProposal) {
  const scoreA = (a.score ?? 0) + a.marketSnapshot.confidence * 100;
  const scoreB = (b.score ?? 0) + b.marketSnapshot.confidence * 100;
  return scoreB - scoreA;
}

export function createStrategyAgent(paymentConfig?: AgentPaymentOverrides) {
  return new SkillDrivenAgent({
    agentId: "strategy-agent",
    agentType: "strategy",
    agentAddress: "0x1111111111111111111111111111111111111111",
    vault: process.env.DEMO_VAULT_ADDRESS ?? "demo-vault",
    skillPath: path.resolve(process.cwd(), "agents/strategy-agent/skill.md"),
    promptPath: path.resolve(process.cwd(), "agents/strategy-agent/system_prompt.md"),
    paymentConfig,
  });
}

export function createUserAgent(paymentConfig?: AgentPaymentOverrides) {
  return new SkillDrivenAgent({
    agentId: "user-agent",
    agentType: "user",
    agentAddress: "0x2222222222222222222222222222222222222222",
    vault: process.env.DEMO_VAULT_ADDRESS ?? "demo-vault",
    skillPath: path.resolve(process.cwd(), "agents/user-agent/skill.md"),
    promptPath: path.resolve(process.cwd(), "agents/user-agent/system_prompt.md"),
    paymentConfig,
  });
}
