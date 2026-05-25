"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TopNavBar } from "@/components/TopNavBar";
import { type AgentType } from "@/lib/contracts";
import { connectWallet, ensureHeLaNetwork, persistConnectedAccount, signMessage } from "@/lib/wallet";

const AGENT_TYPES = ["trading", "farming", "scheduling", "rebalancing", "content", "business"] as const;
const PUBLISH_MODES = ["guided", "technical"] as const;

type PublishMode = (typeof PUBLISH_MODES)[number];

type PublishReviewResult = {
  verdict: "approve" | "review" | "block";
  riskLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  findings: Array<{
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    detail: string;
  }>;
  recommendedChanges: string[];
  userSafetyNotes: string[];
  source: "heuristic" | "gemini" | "gemini+heuristic";
};

type GeneratedField = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "address";
  required: boolean;
  options?: string[];
  placeholder?: string;
};

type GeneratedAgentPayload = {
  name: string;
  description: string;
  agentType: AgentType;
  priceHLUSD: number;
  configSchema: { fields: GeneratedField[] };
  executionLogic: string;
  geminiPrompt: string;
  tags: string[];
  estimatedRuntime: string;
};

type GenerateResponse = {
  agent: GeneratedAgentPayload;
  executionCode: string;
  ready: boolean;
};

type GeneratedDraft = {
  agent: GeneratedAgentPayload;
  executionCode: string;
};

type DeployResponse = {
  agentId: string;
  txHash: string;
  explorerUrl?: string;
  marketplaceUrl?: string;
  deployed: boolean;
};

function defaultSchemaFor(agentType: string) {
  if (agentType === "scheduling") {
    return JSON.stringify(
      [
        { key: "recipient", type: "text", placeholder: "0x..." },
        { key: "amount", type: "number", placeholder: "100" },
        { key: "frequency", type: "select", options: ["daily", "weekly", "monthly"] }
      ],
      null,
      2
    );
  }

  return JSON.stringify({ notes: "text" }, null, 2);
}

function toPublishConfigSchema(fields: GeneratedField[]) {
  return JSON.stringify(
    fields.map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      options: field.options
    })),
    null,
    2
  );
}

function toNaturalWorkflowSummary(agent: GeneratedAgentPayload) {
  return [
    `Agent goal: ${agent.executionLogic}`,
    `Runtime profile: ${agent.estimatedRuntime}`,
    `Gemini behavior prompt: ${agent.geminiPrompt}`,
    `Tags: ${agent.tags.join(", ")}`
  ].join("\n");
}

function parseSchemaForDeploy(schemaRaw: string): { fields: GeneratedField[] } {
  const parsed = JSON.parse(schemaRaw) as unknown;

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Configuration schema must be a non-empty JSON array for AI deployment mode.");
  }

  const fields: GeneratedField[] = parsed.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid config field at index ${index}.`);
    }

    const record = item as {
      key?: string;
      label?: string;
      type?: string;
      options?: string[];
      placeholder?: string;
      required?: boolean;
    };

    const key = (record.key || "").trim();
    const label = (record.label || key).trim();
    const rawType = (record.type || "text").trim().toLowerCase();

    if (!key) {
      throw new Error(`Config field ${index + 1} is missing key.`);
    }

    const validTypes = new Set(["text", "number", "select", "address"]);
    if (!validTypes.has(rawType)) {
      throw new Error(`Config field "${key}" has unsupported type "${rawType}" for AI deployment mode.`);
    }

    return {
      key,
      label: label || key,
      type: rawType as GeneratedField["type"],
      required: typeof record.required === "boolean" ? record.required : true,
      options: Array.isArray(record.options) ? record.options : undefined,
      placeholder: typeof record.placeholder === "string" ? record.placeholder : undefined
    };
  });

  return { fields };
}

export default function PublishPage() {
  const [publishMode, setPublishMode] = useState<PublishMode>("guided");
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedDraft | null>(null);
  const [technicalExecutionCode, setTechnicalExecutionCode] = useState("");
  const [generatedContext, setGeneratedContext] = useState<{
    tags: string[];
    estimatedRuntime: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    agentType: "trading",
    price: "",
    configSchema: defaultSchemaFor("trading"),
    workflowSummary: ""
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<PublishReviewResult | null>(null);

  const explorerBase = useMemo(
    () => (process.env.NEXT_PUBLIC_HELA_RPC ? "https://testnet-blockexplorer.helachain.com/tx/" : null),
    []
  );

  const handleInputChange = (field: string, value: string) => {
    setReviewResult(null);
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "agentType" && !prev.configSchema.trim() ? { configSchema: defaultSchemaFor(value) } : {})
    }));
  };

  const handleGenerateFromPrompt = async () => {
    try {
      if (!generationPrompt.trim()) {
        setError("Describe your agent in plain English before generating.");
        return;
      }

      setIsGenerating(true);
      setError(null);
      setReviewResult(null);
      setStatusMessage("Generating agent draft with Gemini...");

      const response = await fetch("/api/agents/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          prompt: generationPrompt.trim()
        })
      });

      const payload = (await response.json()) as GenerateResponse | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Failed to generate agent draft.");
      }

      const generated = payload.agent;

      setFormData({
        name: generated.name,
        description: generated.description,
        agentType: generated.agentType,
        price: String(generated.priceHLUSD),
        configSchema: toPublishConfigSchema(generated.configSchema.fields),
        workflowSummary: toNaturalWorkflowSummary(generated)
      });
      setGeneratedContext({
        tags: generated.tags,
        estimatedRuntime: generated.estimatedRuntime
      });
      setTechnicalExecutionCode(payload.executionCode);
      setGeneratedDraft({
        agent: generated,
        executionCode: payload.executionCode
      });
      setStatusMessage("Agent draft generated. Review fields, run safety review, then publish.");
    } catch (generationError) {
      setStatusMessage(null);
      setGeneratedDraft(null);
      setGeneratedContext(null);
      setError(generationError instanceof Error ? generationError.message : "Failed to generate agent draft.");
    } finally {
      setIsGenerating(false);
    }
  };

  const runSafetyReview = async () => {
    try {
      if (!formData.name || !formData.description || !formData.price || !formData.workflowSummary.trim()) {
        setError("Fill all publish fields and add a workflow summary before running the safety review.");
        return;
      }

      JSON.parse(formData.configSchema);

      setIsReviewing(true);
      setError(null);
      setStatusMessage("Running Gemini safety review...");

      const response = await fetch("/api/agents/review", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          agentType: formData.agentType,
          price: formData.price,
          configSchema: formData.configSchema,
          workflowSummary: formData.workflowSummary
        })
      });

      const payload = (await response.json()) as PublishReviewResult | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Safety review failed.");
      }

      setReviewResult(payload);
      setStatusMessage(
        payload.verdict === "approve"
          ? "Safety review passed. Publishing is enabled."
          : payload.verdict === "review"
            ? "Safety review requires fixes before publishing."
            : "Safety review blocked this submission."
      );
    } catch (reviewError) {
      if (reviewError instanceof SyntaxError) {
        setError("Configuration schema must be valid JSON.");
      } else {
        setError(reviewError instanceof Error ? reviewError.message : "Safety review failed.");
      }
      setStatusMessage(null);
      setReviewResult(null);
    } finally {
      setIsReviewing(false);
    }
  };

  const handlePublish = async () => {
    try {
      if (!formData.name || !formData.description || !formData.price || !formData.workflowSummary.trim()) {
        setError("Please fill in all required fields.");
        return;
      }

      JSON.parse(formData.configSchema);

      if (!reviewResult || reviewResult.verdict !== "approve") {
        setError("Run the AI safety review and resolve any issues before publishing.");
        return;
      }

      setIsPublishing(true);
      setError(null);
      setLastTxHash(null);
      setStatusMessage("Connecting wallet...");

      await ensureHeLaNetwork();
      const connectedAccount = await connectWallet();
      persistConnectedAccount(connectedAccount);

      const parsedPrice = Number(formData.price);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        throw new Error("Activation price must be a valid positive number.");
      }

      const executionCodeToDeploy =
        publishMode === "guided"
          ? generatedDraft?.executionCode || technicalExecutionCode.trim()
          : technicalExecutionCode.trim();

      if (!executionCodeToDeploy) {
        throw new Error("Runtime execution code is required for full deployment.");
      }

      const deployBaseAgent =
        publishMode === "guided" && generatedDraft
          ? generatedDraft.agent
          : {
              name: formData.name.trim(),
              description: formData.description.trim(),
              agentType: formData.agentType as AgentType,
              priceHLUSD: parsedPrice,
              configSchema: parseSchemaForDeploy(formData.configSchema),
              executionLogic: formData.workflowSummary.trim(),
              geminiPrompt: formData.workflowSummary.trim(),
              tags: ["custom", formData.agentType, "manual"],
              estimatedRuntime: "on demand"
            };

      const deploymentAgent: GeneratedAgentPayload = {
        ...deployBaseAgent,
        name: formData.name.trim(),
        description: formData.description.trim(),
        agentType: formData.agentType as AgentType,
        priceHLUSD: parsedPrice,
        configSchema: parseSchemaForDeploy(formData.configSchema),
        executionLogic: formData.workflowSummary.trim()
      };

      setStatusMessage("Requesting wallet signature for deployment...");
      const signature = await signMessage(`Deploy agent: ${deploymentAgent.name}`);

      setStatusMessage("Deploying agent runtime and publishing on-chain...");
      const deployResponse = await fetch("/api/agents/deploy", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          agent: deploymentAgent,
          executionCode: executionCodeToDeploy,
          developerAddress: connectedAccount,
          signature
        })
      });

      const deployPayload = (await deployResponse.json()) as DeployResponse | { error?: string; details?: string };
      if (!deployResponse.ok) {
        throw new Error(
          "error" in deployPayload && deployPayload.error
            ? deployPayload.details
              ? `${deployPayload.error}: ${deployPayload.details}`
              : deployPayload.error
            : "Failed to deploy AI agent."
        );
      }

      setLastTxHash("txHash" in deployPayload ? (deployPayload.txHash ?? null) : null);
      setStatusMessage("Agent runtime deployed and published on-chain.");

      setFormData({
        name: "",
        description: "",
        agentType: "trading",
        price: "",
        configSchema: defaultSchemaFor("trading"),
        workflowSummary: ""
      });
      setGeneratedDraft(null);
      setTechnicalExecutionCode("");
      setGeneratedContext(null);
      setReviewResult(null);
      setGenerationPrompt("");
    } catch (publishError) {
      if (publishError instanceof SyntaxError) {
        setError("Configuration schema must be valid JSON.");
      } else {
        setError(publishError instanceof Error ? publishError.message : "Failed to publish agent.");
      }
      setStatusMessage(null);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <TopNavBar />

      <header className="mt-24 border-b border-white/10 px-8 pb-8 pt-16">
        <div className="mb-4 flex items-center gap-4">
          <span className="bracket-link cursor-pointer font-mono text-sm text-white">PUBLISH</span>
          <span className="select-none font-mono text-sm text-white/20">░░░░░░░░░░░░░░</span>
        </div>
        <h1 className="font-headline text-[120px] leading-none tracking-tight text-white">PUBLISH</h1>
      </header>

      <div className="mx-auto max-w-2xl p-8 py-16">
        <div className="flex flex-col gap-8 border border-white/12 p-8">
          <div>
            <h2 className="mb-2 font-headline text-4xl uppercase text-white">Publish Your Agent</h2>
            <p className="text-sm uppercase leading-relaxed text-white/60">
              Register a new agent directly on HeLa using your connected developer wallet.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 border border-white/12 p-3 md:grid-cols-2">
            <button
              onClick={() => setPublishMode("guided")}
              className={`border px-4 py-3 font-headline text-lg uppercase transition-colors ${
                publishMode === "guided" ? "border-white bg-white text-black" : "border-white/30 text-white hover:border-white"
              }`}
            >
              [ Describe with AI ]
            </button>
            <button
              onClick={() => setPublishMode("technical")}
              className={`border px-4 py-3 font-headline text-lg uppercase transition-colors ${
                publishMode === "technical" ? "border-white bg-white text-black" : "border-white/30 text-white hover:border-white"
              }`}
            >
              [ Technical JSON ]
            </button>
          </div>

          {publishMode === "guided" && (
            <div className="flex flex-col gap-4 border border-white/12 bg-white/5 p-4">
              <p className="font-headline text-2xl uppercase text-white">Non-Technical Builder</p>
              <p className="font-mono text-xs uppercase text-white/60">
                Describe your agent in plain English and Gemini will draft its schema, price, and workflow.
              </p>
              <textarea
                value={generationPrompt}
                onChange={(event) => setGenerationPrompt(event.target.value)}
                placeholder="Example: Build an agent that checks my product support inbox every hour, categorizes urgency, and drafts safe reply options."
                className="bg-surface-container border border-white/20 p-3 font-body text-sm text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none"
                rows={5}
              />
              <button
                onClick={handleGenerateFromPrompt}
                disabled={isGenerating || isReviewing || isPublishing}
                className="border border-white px-6 py-3 font-headline text-lg uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
              >
                {isGenerating ? "GENERATING..." : "[ GENERATE AGENT DRAFT ↗ ]"}
              </button>
              {generatedContext && (
                <div className="border border-white/10 bg-black/30 p-3">
                  <p className="font-mono text-xs uppercase text-white/60">
                    Runtime: {generatedContext.estimatedRuntime}
                  </p>
                  <p className="mt-2 font-mono text-xs uppercase text-white/60">
                    Tags: {generatedContext.tags.join(" | ")}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase text-white/60">Agent Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => handleInputChange("name", event.target.value)}
                placeholder="e.g., Advanced Trading Bot"
                className="bg-surface-container border border-white/20 p-3 font-body text-sm text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase text-white/60">Description *</label>
              <textarea
                value={formData.description}
                onChange={(event) => handleInputChange("description", event.target.value)}
                placeholder="Describe what your agent does..."
                className="bg-surface-container border border-white/20 p-3 font-body text-sm text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none"
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase text-white/60">Agent Type *</label>
              <select
                value={formData.agentType}
                onChange={(event) => handleInputChange("agentType", event.target.value)}
                className="bg-surface-container border border-white/20 p-3 font-body text-sm uppercase text-white transition-colors focus:border-white focus:outline-none"
              >
                {AGENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase text-white/60">Activation Price (HLUSD) *</label>
              <input
                type="number"
                step="0.1"
                value={formData.price}
                onChange={(event) => handleInputChange("price", event.target.value)}
                placeholder="e.g., 2.5"
                className="bg-surface-container border border-white/20 p-3 font-body text-sm text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase text-white/60">Configuration Schema (JSON)</label>
              <textarea
                value={formData.configSchema}
                onChange={(event) => handleInputChange("configSchema", event.target.value)}
                className="bg-surface-container border border-white/20 p-3 font-mono text-xs text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none"
                rows={8}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase text-white/60">Workflow & Contract Behavior Summary *</label>
              <textarea
                value={formData.workflowSummary}
                onChange={(event) => handleInputChange("workflowSummary", event.target.value)}
                placeholder="Explain exactly what the agent does, what permissions it asks for, and how it handles user funds."
                className="bg-surface-container border border-white/20 p-3 font-body text-sm text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none"
                rows={5}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase text-white/60">
                Runtime Execution Code (JavaScript) *
              </label>
              <textarea
                value={technicalExecutionCode}
                onChange={(event) => setTechnicalExecutionCode(event.target.value)}
                placeholder={
                  publishMode === "guided"
                    ? "Auto-filled from Gemini draft. You can still edit if needed."
                    : "Paste async function executeAgent(config) { ... }"
                }
                className="bg-surface-container border border-white/20 p-3 font-mono text-xs text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none"
                rows={10}
              />
            </div>

            <div className="border border-white/10 bg-white/5 p-4">
              <p className="font-mono text-xs font-bold uppercase text-white/60">Requirements</p>
              <p className="mt-2 text-xs uppercase leading-relaxed text-white/60">
                Wallet on HeLa, valid config schema JSON, runtime execution code, clear workflow disclosure, and a passed safety review before deployment.
              </p>
            </div>

            <div className="border border-white/12 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-headline text-2xl uppercase text-white">Safety Review</p>
                  <p className="mt-1 font-mono text-xs uppercase text-white/60">
                    Gemini screens new listings for wallet-draining, unethical, or illegal behavior.
                  </p>
                </div>
                <button
                  onClick={runSafetyReview}
                  disabled={isReviewing || isPublishing || isGenerating}
                  className="border border-white px-6 py-3 font-headline text-lg uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                >
                  {isReviewing ? "REVIEWING..." : "[ RUN SAFETY REVIEW ↗ ]"}
                </button>
              </div>

              {reviewResult && (
                <div className="mt-6 flex flex-col gap-4 border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="font-headline text-xl uppercase text-white">
                      Verdict: {reviewResult.verdict.toUpperCase()}
                    </p>
                    <p className="font-mono text-xs uppercase text-white/60">
                      Risk: {reviewResult.riskLevel.toUpperCase()} | Source: {reviewResult.source.toUpperCase()}
                    </p>
                  </div>

                  <p className="font-body text-sm text-white/80">{reviewResult.summary}</p>

                  {reviewResult.findings.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <p className="font-mono text-xs uppercase text-white/50">Findings</p>
                      {reviewResult.findings.map((finding, index) => (
                        <div key={`${finding.title}-${index}`} className="border border-white/10 p-3">
                          <p className="font-headline text-lg uppercase text-white">
                            {finding.severity.toUpperCase()} | {finding.title}
                          </p>
                          <p className="mt-1 text-sm text-white/70">{finding.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {reviewResult.recommendedChanges.length > 0 && (
                    <div>
                      <p className="font-mono text-xs uppercase text-white/50">Recommended Changes</p>
                      <ul className="mt-2 space-y-2 text-sm text-white/70">
                        {reviewResult.recommendedChanges.map((change) => (
                          <li key={change}>- {change}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reviewResult.userSafetyNotes.length > 0 && (
                    <div>
                      <p className="font-mono text-xs uppercase text-white/50">Safety Notes</p>
                      <ul className="mt-2 space-y-2 text-sm text-white/70">
                        {reviewResult.userSafetyNotes.map((note) => (
                          <li key={note}>- {note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {statusMessage && <p className="font-mono text-xs uppercase text-white/50">{statusMessage}</p>}
            {error && <p className="font-mono text-xs uppercase text-red-400">{error}</p>}
            {lastTxHash && (
              <p className="font-mono text-xs uppercase text-white/60">
                Tx Hash:{" "}
                {explorerBase ? (
                  <a href={`${explorerBase}${lastTxHash}`} target="_blank" rel="noreferrer" className="text-white">
                    {lastTxHash}
                  </a>
                ) : (
                  lastTxHash
                )}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <button
              onClick={handlePublish}
              disabled={isPublishing || isReviewing || isGenerating || reviewResult?.verdict !== "approve"}
              className="flex-1 border border-white bg-white py-4 font-headline text-xl uppercase text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50"
            >
              {isPublishing ? "PUBLISHING..." : "[ PUBLISH ↗ ]"}
            </button>

            <Link
              href="/marketplace"
              className="flex-1 border border-white py-4 text-center font-headline text-xl uppercase text-white transition-colors hover:bg-white hover:text-black"
            >
              [ BACK ↗ ]
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
