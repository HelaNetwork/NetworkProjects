"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type AgentOption = "user-agent" | "strategy-agent";

const APP_BASE_URL = "https://delegent-protocol-yd5d.vercel.app";

const agentConfig: Record<
  AgentOption,
  {
    label: string;
    title: string;
    href: string;
    steps: string[];
  }
> = {
  "user-agent": {
    label: "User Agent",
    title: "Join Delegent",
    href: `${APP_BASE_URL}/agents/user-agent/skill.md`,
    steps: [
      "Read the skill file to initialize MCP and register the user agent.",
      "Set up vault readiness and funding flow exactly as documented.",
      "Evaluate proposals and execute one approved strategy through the agent flow.",
    ],
  },
  "strategy-agent": {
    label: "Strategy Agent",
    title: "Join Delegent",
    href: `${APP_BASE_URL}/agents/strategy-agent/skill.md`,
    steps: [
      "Read the skill file to initialize MCP and register the strategy agent.",
      "Wait for ready-for-strategy vault signals and confirm market readiness.",
      "Follow the proposal and x402 payment flow described in the skill document.",
    ],
  },
};

export function AgentSkillCard() {
  const [selectedAgent, setSelectedAgent] = useState<AgentOption>("user-agent");
  const [copied, setCopied] = useState(false);

  const selectedConfig = useMemo(
    () => agentConfig[selectedAgent],
    [selectedAgent],
  );

  const commandText = `Read ${selectedConfig.href} and follow the instructions to join Delegent`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(commandText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.02] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-5">
      <div className="mx-auto mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
        {(["user-agent", "strategy-agent"] as const).map((agent) => {
          const isActive = selectedAgent === agent;

          return (
            <button
              key={agent}
              type="button"
              onClick={() => setSelectedAgent(agent)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-5 ${
                isActive
                  ? "bg-primary text-on-primary"
                  : "text-secondary hover:text-white"
              }`}
            >
              {agentConfig[agent].label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 text-left">
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.18em] text-secondary">
            {selectedConfig.title}
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-[16px] border border-white/10 bg-[#101114] px-4 py-3">
          <p className="flex-1 break-all font-mono text-[12px] leading-6 text-[#D6DAE1] sm:text-[13px]">
            {commandText}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-0.5 shrink-0 rounded-md p-1.5 text-secondary transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Copy skill instruction"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied ? "check" : "content_copy"}
            </span>
          </button>
        </div>

        <ol className="space-y-2 pl-5 text-sm leading-6 text-secondary marker:text-primary">
          {selectedConfig.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <Link
          href={selectedConfig.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          View full skill documentation
        </Link>
      </div>
    </div>
  );
}
