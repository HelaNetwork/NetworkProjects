"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TopNavBar } from "@/components/TopNavBar";
import Link from "next/link";
import { connectWallet, ensureHeLaNetwork, getConnectedAccount, transferHLUSD } from "@/lib/wallet";

type DashboardAgent = {
  id: number;
  name: string;
  description: string;
  type: string;
  agentType: string;
  isLive: boolean;
  activatedAt: number | null;
  lastExecutionAt: number | null;
  executions: number;
};

type PublishedAgent = {
  id: number;
  name: string;
  description: string;
  type: string;
  agentType: string;
  isLive: boolean;
  image: string;
  price: number;
  developer: string;
  activeCount: number;
};

type ActivityItem = {
  id: string;
  kind: "activation" | "execution";
  agentId: number;
  agentName: string;
  action: string;
  details: string;
  timestamp: number;
  txHash: string;
};

type DashboardRouteResponse = {
  walletAddress?: string;
  activeAgents?: DashboardAgent[];
  publishedAgents?: PublishedAgent[];
  activity?: ActivityItem[];
  error?: string;
};

type AutomationJobView = {
  id: string;
  agentId: string;
  ownerAddress: string;
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  nextRunAt: string;
  lastRunAt?: string;
  status: "active" | "paused" | "error";
  userConfig: Record<string, unknown>;
  lastResult?: string;
  lastError?: string;
  lastExecutionTxHash?: string;
  agentWalletAddress: string | null;
  balanceHLUSD?: string | null;
  balanceValue?: number | null;
  nativeBalanceHELA?: string | null;
  nativeBalanceValue?: number | null;
  recommendedMinimumHLUSD?: string | null;
  gasFundingStatus?: "missing" | "low" | "ready" | "unknown";
  gasHint?: string;
  fundingStatus?: "empty" | "low" | "funded" | "unknown";
  fundingHint?: string;
};

type AutomationLogView = {
  id: string;
  agentId: string;
  ownerAddress: string;
  jobId?: string;
  success: boolean;
  result: string;
  txHash?: string;
  executedAt: string;
};

const FAUCET_URL = "https://testnet-faucet.helachain.com/";

function normalizeTimestampMs(value: number): number {
  if (value > 1_000_000_000_000) {
    return value;
  }
  return value * 1000;
}

function formatRelativeTime(value: number | string | null | undefined): string {
  if (!value) {
    return "Never";
  }

  const timestampMs =
    typeof value === "string" ? new Date(value).getTime() : normalizeTimestampMs(value);

  if (Number.isNaN(timestampMs)) {
    return "Never";
  }

  const deltaMs = Date.now() - timestampMs;
  if (deltaMs <= 0) {
    return "Just now";
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (deltaMs < minute) {
    return "Just now";
  }
  if (deltaMs < hour) {
    const minutes = Math.floor(deltaMs / minute);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (deltaMs < day) {
    const hours = Math.floor(deltaMs / hour);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(deltaMs / day);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatDate(value: number | null): string {
  if (!value) {
    return "-";
  }
  return new Date(normalizeTimestampMs(value)).toLocaleDateString();
}

function shortenAddress(address: string): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function safeConfigPreview(config: Record<string, unknown>) {
  return Object.entries(config)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" | ");
}

function getAutomationReadiness(job: AutomationJobView): {
  label: string;
  className: string;
} {
  if (job.fundingStatus === "funded" && job.gasFundingStatus === "ready") {
    return {
      label: "READY TO RUN",
      className: "text-emerald-300 border-emerald-300/50 bg-emerald-300/10"
    };
  }

  if (job.gasFundingStatus === "missing" || job.gasFundingStatus === "low") {
    return {
      label: "NEEDS GAS",
      className: "text-yellow-300 border-yellow-300/50 bg-yellow-300/10"
    };
  }

  if (job.fundingStatus === "empty" || job.fundingStatus === "low") {
    return {
      label: "NEEDS HLUSD",
      className: "text-red-300 border-red-300/50 bg-red-300/10"
    };
  }

  return {
    label: "CHECK FUNDING",
    className: "text-white/70 border-white/20 bg-white/5"
  };
}

function getAutomationPanelClass(job: AutomationJobView): string {
  if (job.fundingStatus === "funded" && job.gasFundingStatus === "ready") {
    return "border-emerald-300/30 bg-emerald-300/5";
  }

  if (job.gasFundingStatus === "missing" || job.gasFundingStatus === "low") {
    return "border-yellow-300/30 bg-yellow-300/5";
  }

  if (job.fundingStatus === "empty" || job.fundingStatus === "low") {
    return "border-red-300/30 bg-red-300/5";
  }

  return "border-white/12 bg-white/5";
}

function formatWalletBalance(job: AutomationJobView): string {
  if (job.recommendedMinimumHLUSD === "0") {
    return "N/A (not required)";
  }

  return `${job.balanceHLUSD || "0"} HLUSD`;
}

export default function DashboardPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeAgents, setActiveAgents] = useState<DashboardAgent[]>([]);
  const [publishedAgents, setPublishedAgents] = useState<PublishedAgent[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);
  const [automationJobs, setAutomationJobs] = useState<AutomationJobView[]>([]);
  const [automationLogs, setAutomationLogs] = useState<AutomationLogView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeJobActionId, setActiveJobActionId] = useState<string | null>(null);
  const [activeGasFundingJobId, setActiveGasFundingJobId] = useState<string | null>(null);
  const [activeHlusdFundingJobId, setActiveHlusdFundingJobId] = useState<string | null>(null);
  const [hlusdFundingAmounts, setHlusdFundingAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const runningAgentsCount = useMemo(
    () => activeAgents.filter((agent) => agent.isLive).length,
    [activeAgents]
  );

  const totalExecutions = useMemo(
    () => activeAgents.reduce((sum, agent) => sum + agent.executions, 0) + automationLogs.length,
    [activeAgents, automationLogs]
  );

  const combinedFeed = useMemo(() => {
    const automationItems = automationLogs.map((log) => ({
      id: `automation-${log.id}`,
      agentName: `Agent ${log.agentId}`,
      action: log.success ? "Automatic run succeeded" : "Automatic run failed",
      details: log.result,
      timestamp: new Date(log.executedAt).getTime(),
      kind: "execution" as const
    }));

    const routeItems = activityLog.map((item) => ({
      id: item.id,
      agentName: item.agentName,
      action: item.action,
      details: item.details,
      timestamp: normalizeTimestampMs(item.timestamp),
      kind: item.kind
    }));

    return [...routeItems, ...automationItems].sort((left, right) => right.timestamp - left.timestamp);
  }, [activityLog, automationLogs]);

  const handleCopyWalletAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      setError("Failed to copy agent wallet address.");
    }
  };

  const handleJobAction = async (jobId: string, action: "pause" | "resume" | "run_now") => {
    try {
      setActiveJobActionId(`${jobId}:${action}`);
      setError(null);

      const response = await fetch(`/api/automation/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ action })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to update automation job.");
      }

      if (walletAddress) {
        await loadDashboardForAddress(walletAddress);
      }
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to update automation job.");
    } finally {
      setActiveJobActionId(null);
    }
  };

  const handleFundGas = async (jobId: string) => {
    try {
      setActiveGasFundingJobId(jobId);
      setError(null);

      const response = await fetch(`/api/automation/jobs/${jobId}/fund-gas`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ amount: "0.02" })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to fund agent gas wallet.");
      }

      if (walletAddress) {
        await loadDashboardForAddress(walletAddress);
      }
    } catch (fundingError) {
      setError(fundingError instanceof Error ? fundingError.message : "Failed to fund agent gas wallet.");
    } finally {
      setActiveGasFundingJobId(null);
    }
  };

  const handleHLUSDAmountChange = (jobId: string, value: string) => {
    setHlusdFundingAmounts((current) => ({
      ...current,
      [jobId]: value
    }));
  };

  const handleFundHLUSD = async (job: AutomationJobView) => {
    if (!job.agentWalletAddress) {
      setError("Agent wallet address is unavailable for this job.");
      return;
    }

    const amount = (hlusdFundingAmounts[job.id] || "5").trim();

    try {
      setActiveHlusdFundingJobId(job.id);
      setError(null);

      await ensureHeLaNetwork();
      await connectWallet();
      await transferHLUSD(job.agentWalletAddress, amount);

      if (walletAddress) {
        await loadDashboardForAddress(walletAddress);
      }
    } catch (fundingError) {
      setError(fundingError instanceof Error ? fundingError.message : "Failed to send HLUSD to the agent wallet.");
    } finally {
      setActiveHlusdFundingJobId(null);
    }
  };

  const loadDashboardForAddress = useCallback(async (address: string) => {
    const [dashboardResponse, automationResponse] = await Promise.all([
      fetch(`/api/agents/user/${address}`, {
        method: "GET",
        cache: "no-store"
      }),
      fetch(`/api/automation/overview?ownerAddress=${encodeURIComponent(address)}`, {
        method: "GET",
        cache: "no-store"
      }).catch(() => null)
    ]);

    const dashboardData = (await dashboardResponse.json()) as DashboardRouteResponse;
    if (!dashboardResponse.ok) {
      throw new Error(dashboardData.error || "Failed to load dashboard data.");
    }

    const nextJobs: AutomationJobView[] = [];
    const nextLogs: AutomationLogView[] = [];

    if (automationResponse) {
      const automationData = (await automationResponse.json()) as {
        jobs?: AutomationJobView[];
        logs?: AutomationLogView[];
        error?: string;
      };

      if (automationResponse.ok) {
        nextJobs.push(...(automationData.jobs || []));
        nextLogs.push(...(automationData.logs || []));
      }
    }

    setWalletAddress(dashboardData.walletAddress || address);
    setActiveAgents(Array.isArray(dashboardData.activeAgents) ? dashboardData.activeAgents : []);
    setPublishedAgents(Array.isArray(dashboardData.publishedAgents) ? dashboardData.publishedAgents : []);
    setActivityLog(Array.isArray(dashboardData.activity) ? dashboardData.activity : []);
    setAutomationJobs(nextJobs);
    setAutomationLogs(nextLogs);
  }, []);

  const bootstrapDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const connected = await getConnectedAccount();
      if (!connected) {
        setWalletAddress(null);
        setActiveAgents([]);
        setPublishedAgents([]);
        setActivityLog([]);
        setAutomationJobs([]);
        setAutomationLogs([]);
        setError("Connect your MetaMask wallet to load your dashboard.");
        return;
      }

      await loadDashboardForAddress(connected);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [loadDashboardForAddress]);

  useEffect(() => {
    void bootstrapDashboard();
  }, [bootstrapDashboard]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const account = await connectWallet();
      await ensureHeLaNetwork();
      await loadDashboardForAddress(account);
    } catch (connectError: unknown) {
      setError(connectError instanceof Error ? connectError.message : "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <TopNavBar />

      <header className="mt-24 border-b border-white/10 px-8 pb-8 pt-16">
        <div className="mb-4 flex items-center gap-4">
          <span className="cursor-pointer font-mono text-sm text-white bracket-link">DASHBOARD</span>
          <span className="select-none font-mono text-sm text-white/20">░░░░░░░░░░░░░░</span>
        </div>
        <h1 className="font-headline text-[120px] leading-none tracking-tight text-white">AGENTS</h1>
      </header>

      <div className="mx-auto max-w-7xl p-8">
        {!walletAddress && !isLoading && (
          <div className="mb-8 flex flex-col gap-4 border border-white/12 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-headline text-3xl uppercase text-white">Wallet Required</h2>
              <p className="font-body text-sm uppercase text-white/60">
                Connect MetaMask on HeLa to load active agents, automation jobs, and execution history.
              </p>
            </div>
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="border border-white bg-white px-6 py-3 font-headline uppercase text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50"
            >
              {isConnecting ? "CONNECTING..." : "[ CONNECT WALLET ↗ ]"}
            </button>
          </div>
        )}

        {error && (
          <div className="mb-8 border border-red-500/60 bg-red-500/10 p-4">
            <p className="font-mono text-xs uppercase text-red-200">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="mb-8 border border-white/12 p-6">
            <p className="font-mono text-sm uppercase text-white/60">Loading dashboard...</p>
          </div>
        )}

        {walletAddress && (
          <div className="mb-8 border border-white/12 p-4">
            <p className="font-mono text-xs uppercase text-white/60">Connected Wallet</p>
            <p className="break-all font-mono text-sm text-white">{walletAddress}</p>
          </div>
        )}

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="flex flex-col gap-2 border border-white/12 p-6">
            <p className="font-mono text-xs uppercase text-white/60">Active Agents</p>
            <p className="font-headline text-6xl text-white">{activeAgents.length}</p>
          </div>
          <div className="flex flex-col gap-2 border border-white/12 p-6">
            <p className="font-mono text-xs uppercase text-white/60">Total Executions</p>
            <p className="font-headline text-6xl text-white">{totalExecutions}</p>
          </div>
          <div className="flex flex-col gap-2 border border-white/12 p-6">
            <p className="font-mono text-xs uppercase text-white/60">Running Agents</p>
            <p className="font-headline text-6xl text-white">{runningAgentsCount}</p>
          </div>
          <div className="flex flex-col gap-2 border border-white/12 p-6">
            <p className="font-mono text-xs uppercase text-white/60">Automation Jobs</p>
            <p className="font-headline text-6xl text-white">{automationJobs.length}</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 font-headline text-4xl uppercase text-white">Automation Jobs</h2>

          {automationJobs.length === 0 ? (
            <div className="border border-white/12 p-8">
              <p className="font-mono text-xs uppercase text-white/60">
                No automation jobs created yet. Open an automation-ready agent and create one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {automationJobs.map((job) => (
                <div key={job.id} className="border border-white/12 p-6 transition-colors hover:border-white">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    {(() => {
                      const readiness = getAutomationReadiness(job);
                      return (
                        <>
                    <div>
                      <h3 className="font-headline text-2xl uppercase text-white">Agent {job.agentId}</h3>
                      <p className="font-mono text-xs uppercase text-white/60">Frequency: {job.frequency}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div
                        className={`font-mono text-xs uppercase ${
                          job.status === "active"
                            ? "text-emerald-300"
                            : job.status === "error"
                              ? "text-red-400"
                              : "text-white/50"
                        }`}
                      >
                        {job.status}
                      </div>
                      <span
                        className={`border px-3 py-1 font-mono text-[10px] uppercase ${readiness.className}`}
                      >
                        {readiness.label}
                      </span>
                    </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Agent Wallet</p>
                      <p className="mt-1 break-all font-mono text-xs text-white/80">{job.agentWalletAddress || "Unavailable"}</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Wallet Balance</p>
                      <p className="mt-1 font-mono text-sm text-white">
                        {formatWalletBalance(job)}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Next Run</p>
                      <p className="mt-1 font-mono text-sm text-white">
                        {job.nextRunAt ? new Date(job.nextRunAt).toLocaleString() : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Last Run</p>
                      <p className="mt-1 font-mono text-sm text-white">
                        {job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : "Not yet"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Config Preview</p>
                      <p className="mt-1 font-mono text-xs text-white/80">{safeConfigPreview(job.userConfig)}</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Last Result</p>
                      <p className="mt-1 font-mono text-xs text-white/80">{job.lastError || job.lastResult || "No runs yet"}</p>
                    </div>
                  </div>

                  <div className={`mt-4 border p-4 ${getAutomationPanelClass(job)}`}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-mono text-xs uppercase text-white/60">Funding Status</p>
                      <span
                        className={`font-mono text-xs uppercase ${
                          job.fundingStatus === "funded"
                            ? "text-emerald-300"
                            : job.fundingStatus === "low"
                              ? "text-yellow-300"
                              : job.fundingStatus === "empty"
                                ? "text-red-300"
                                : "text-white/50"
                        }`}
                      >
                        {job.fundingStatus || "unknown"}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-xs text-white/80">{job.fundingHint || "Funding status unavailable."}</p>
                    {job.recommendedMinimumHLUSD && (
                      <p className="mt-2 font-mono text-xs text-white/50">
                        Recommended minimum: {job.recommendedMinimumHLUSD} HLUSD
                      </p>
                    )}
                    {job.nativeBalanceHELA && (
                      <p className="mt-2 font-mono text-xs text-white/50">
                        Native gas balance: {job.nativeBalanceHELA}
                      </p>
                    )}
                    {job.gasFundingStatus && (
                      <p className="mt-2 font-mono text-xs text-white/50">
                        Gas status: {job.gasFundingStatus} {job.gasHint ? `| ${job.gasHint}` : ""}
                      </p>
                    )}
                  </div>

                  {job.agentWalletAddress && (
                    <div className="mt-4 flex flex-col gap-3">
                      <div className="flex flex-col gap-3 md:flex-row">
                        <button
                          onClick={() => handleCopyWalletAddress(job.agentWalletAddress!)}
                          className="border border-white px-4 py-3 font-headline text-sm uppercase text-white transition-colors hover:bg-white hover:text-black"
                        >
                          [ COPY WALLET ADDRESS ]
                        </button>
                        <a
                          href={FAUCET_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="border border-white bg-white px-4 py-3 text-center font-headline text-sm uppercase text-black transition-colors hover:bg-black hover:text-white"
                        >
                          [ OPEN GAS FAUCET ↗ ]
                        </a>
                        <button
                          onClick={() => handleFundGas(job.id)}
                          disabled={activeGasFundingJobId === job.id}
                          className="border border-white px-4 py-3 font-headline text-sm uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                        >
                          {activeGasFundingJobId === job.id ? "[ FUNDING GAS... ]" : "[ FUND GAS 0.02 HELA ↗ ]"}
                        </button>
                      </div>

                      <div className="border border-white/12 p-3">
                        <p className="font-mono text-[11px] uppercase text-white/50">Fund HLUSD From Connected Wallet</p>
                        <div className="mt-3 flex flex-col gap-3 md:flex-row">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={hlusdFundingAmounts[job.id] || "5"}
                            onChange={(event) => handleHLUSDAmountChange(job.id, event.target.value)}
                            className="border border-white/20 bg-surface-container p-3 font-mono text-sm text-white focus:border-white focus:outline-none md:w-32"
                            placeholder="HLUSD"
                          />
                          <button
                            onClick={() => handleFundHLUSD(job)}
                            disabled={activeHlusdFundingJobId === job.id}
                            className="border border-white bg-white px-4 py-3 font-headline text-sm uppercase text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50"
                          >
                            {activeHlusdFundingJobId === job.id ? "[ SENDING HLUSD... ]" : "[ SEND HLUSD ↗ ]"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-3 md:flex-row">
                    <button
                      onClick={() => handleJobAction(job.id, "run_now")}
                      disabled={activeJobActionId === `${job.id}:run_now`}
                      className="border border-white bg-white px-4 py-3 font-headline text-sm uppercase text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50"
                    >
                      {activeJobActionId === `${job.id}:run_now` ? "[ RUNNING... ]" : "[ RUN NOW ↗ ]"}
                    </button>

                    {job.status === "paused" ? (
                      <button
                        onClick={() => handleJobAction(job.id, "resume")}
                        disabled={activeJobActionId === `${job.id}:resume`}
                        className="border border-white px-4 py-3 font-headline text-sm uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                      >
                        {activeJobActionId === `${job.id}:resume` ? "[ RESUMING... ]" : "[ RESUME ↗ ]"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJobAction(job.id, "pause")}
                        disabled={activeJobActionId === `${job.id}:pause`}
                        className="border border-white px-4 py-3 font-headline text-sm uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                      >
                        {activeJobActionId === `${job.id}:pause` ? "[ PAUSING... ]" : "[ PAUSE ↗ ]"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-12">
          <h2 className="mb-6 font-headline text-4xl uppercase text-white">Published By You</h2>

          {publishedAgents.length === 0 ? (
            <div className="border border-white/12 p-8 text-center">
              <p className="font-mono text-xs uppercase text-white/60">
                No published agents found for this wallet yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {publishedAgents.map((agent) => (
                <div key={`published-${agent.id}`} className="group border border-white/12 p-6 transition-colors hover:border-white">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-headline text-2xl uppercase text-white">{agent.name}</h3>
                      <p className="font-mono text-xs text-white/60">{agent.type}</p>
                    </div>
                    <div className={`flex items-center gap-2 font-mono text-xs ${agent.isLive ? "text-live-signal" : "text-white/20"}`}>
                      <span className={`h-2 w-2 rounded-full ${agent.isLive ? "bg-live-signal" : "bg-white/20"}`}></span>
                      {agent.isLive ? "LIVE" : "IDLE"}
                    </div>
                  </div>

                  <p className="mb-4 font-body text-xs uppercase leading-relaxed text-white/60">{agent.description}</p>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Creator</p>
                      <p className="font-mono text-sm text-white">{shortenAddress(agent.developer)}</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Price</p>
                      <p className="font-mono text-sm text-white">{agent.price} HLUSD</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Activations</p>
                      <p className="font-mono text-sm text-white">{agent.activeCount}</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Open</p>
                      <Link href={`/agent/${agent.id}`} className="font-mono text-sm text-white transition-colors hover:text-white/60">
                        [ VIEW ↗ ]
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-12">
          <h2 className="mb-6 font-headline text-4xl uppercase text-white">Your Active Agents</h2>

          {activeAgents.length === 0 ? (
            <div className="border border-white/12 p-8 text-center">
              <p className="font-mono text-xs uppercase text-white/60">
                No active agents found for this wallet yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAgents.map((agent) => (
                <div key={agent.id} className="group border border-white/12 p-6 transition-colors hover:border-white">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-headline text-2xl uppercase text-white">{agent.name}</h3>
                      <p className="font-mono text-xs text-white/60">{agent.type}</p>
                    </div>
                    <div className={`flex items-center gap-2 font-mono text-xs ${agent.isLive ? "text-live-signal" : "text-white/20"}`}>
                      <span className={`h-2 w-2 rounded-full ${agent.isLive ? "bg-live-signal" : "bg-white/20"}`}></span>
                      {agent.isLive ? "RUNNING" : "IDLE"}
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Activated</p>
                      <p className="font-mono text-sm text-white">{formatDate(agent.activatedAt)}</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Last Execution</p>
                      <p className="font-mono text-sm text-white">{formatRelativeTime(agent.lastExecutionAt)}</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Total Runs</p>
                      <p className="font-mono text-sm text-white">{agent.executions}</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Config</p>
                      <Link href={`/agent/${agent.id}`} className="font-mono text-sm text-white transition-colors hover:text-white/60">
                        [ EDIT ↗ ]
                      </Link>
                    </div>
                  </div>

                  {(agent.agentType === "content" || agent.agentType === "business") ? (
                    <Link
                      href={`/agent/${agent.id}/run`}
                      className="inline-block w-full border border-white bg-white px-6 py-2 font-headline uppercase text-black transition-colors hover:bg-black hover:text-white md:w-auto"
                    >
                      [ INTERACT ↗ ]
                    </Link>
                  ) : (
                    <button className="inline-block w-full cursor-not-allowed border border-white px-6 py-2 font-headline uppercase text-white opacity-50 transition-colors hover:bg-white hover:text-black md:w-auto">
                      [ VIEW LOGS ↗ ]
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-6 font-headline text-4xl uppercase text-white">Activity Feed</h2>

          {combinedFeed.length === 0 ? (
            <div className="border border-white/12 p-8 text-center">
              <p className="font-mono text-xs uppercase text-white/60">
                No activity events available yet.
              </p>
            </div>
          ) : (
            <div className="border border-white/12">
              {combinedFeed.map((log, index) => (
                <div
                  key={log.id}
                  className={`p-6 transition-colors hover:bg-white/5 ${index < combinedFeed.length - 1 ? "border-b border-white/12" : ""}`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h4 className="font-headline text-lg uppercase text-white">{log.agentName}</h4>
                      <p className="font-body text-sm text-white/60">{log.action}</p>
                    </div>
                    <p className="font-mono text-xs text-white/40">{formatRelativeTime(log.timestamp)}</p>
                  </div>
                  <p className="max-h-32 overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs text-white/80 [overflow-wrap:anywhere]">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/marketplace"
            className="inline-block border border-white bg-white px-12 py-4 font-headline text-2xl uppercase text-black transition-colors hover:bg-black hover:text-white"
          >
            [ ADD MORE AGENTS ↗ ]
          </Link>
        </div>
      </div>
    </main>
  );
}
