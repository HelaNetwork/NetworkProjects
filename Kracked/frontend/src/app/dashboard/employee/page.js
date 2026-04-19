"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import {
  getContract,
  formatHLUSD,
  ensureHelaNetwork,
  disconnectWallet,
} from "@/utils/contract";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DonutChart,
  BarChart,
  HBarChart,
  GaugeChart,
} from "@/components/Charts";
import Link from "next/link";

const STAKING_APY = 8.5; // 8.5% APY for HLUSD Staking Pool

const MOCK_RATES = {
  USD: { rate: 1.0, symbol: "$", name: "US Dollar" },
  INR: { rate: 83.5, symbol: "₹", name: "Indian Rupee" },
  EUR: { rate: 0.92, symbol: "€", name: "Euro" },
  GBP: { rate: 0.79, symbol: "£", name: "British Pound" },
  JPY: { rate: 149.5, symbol: "¥", name: "Japanese Yen" },
  AED: { rate: 3.67, symbol: "د.إ", name: "UAE Dirham" },
};

export default function EmployeeDashboard() {
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const [signer, setSigner] = useState(null);
  const [stream, setStream] = useState(null);
  const [accrued, setAccrued] = useState("0");
  const [displayAccrued, setDisplayAccrued] = useState(0);
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("earnings");
  const counterRef = useRef(null);
  const ratePerSecRef = useRef(0);

  const [autoInvestPercent, setAutoInvestPercent] = useState(0);
  const [investedAmount, setInvestedAmount] = useState(0);
  const [investStartTime, setInvestStartTime] = useState(null);
  const [investHistory, setInvestHistory] = useState([]);

  useEffect(() => {
    if (!wallet) return;
    const key = `paystream-invest-${wallet}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      setAutoInvestPercent(data.autoInvestPercent || 0);
      setInvestedAmount(data.investedAmount || 0);
      setInvestStartTime(data.investStartTime || null);
      setInvestHistory(data.investHistory || []);
    }
  }, [wallet]);

  const saveInvestData = (updates) => {
    const data = {
      autoInvestPercent,
      investedAmount,
      investStartTime,
      investHistory,
      ...updates,
    };
    localStorage.setItem(`paystream-invest-${wallet}`, JSON.stringify(data));
  };

  const connect = async () => {
    if (typeof window.ethereum === "undefined")
      return alert("Please install MetaMask or HeLa Wallet!");
    try {
      await ensureHelaNetwork();
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const s = await provider.getSigner();
      setSigner(s);
      setWallet(await s.getAddress());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window.ethereum === "undefined") return;
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          await ensureHelaNetwork();
          const provider = new ethers.BrowserProvider(window.ethereum);
          const s = await provider.getSigner();
          setSigner(s);
          setWallet(await s.getAddress());
        }
      } catch (e) {
        console.error("Check existing connection failed:", e);
      }
    };
    checkExistingConnection();
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setWallet("");
        setSigner(null);
        setStream(null);
        setDisplayAccrued(0);
      } else {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const s = await provider.getSigner();
        setSigner(s);
        setWallet(await s.getAddress());
        setStream(null);
        setDisplayAccrued(0);
      }
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () =>
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  const handleSwitchAccount = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setWallet("");
    setSigner(null);
    setStream(null);
    setDisplayAccrued(0);
    setAccrued("0");
    setHistory([]);
    disconnectWallet();
    if (window.ethereum) {
      window.ethereum
        .request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        })
        .catch(() => {});
    }
    router.push("/dashboard");
  };

  useEffect(() => {
    if (!signer) return;
    loadStream();
    const interval = setInterval(loadStream, 15000);
    return () => clearInterval(interval);
  }, [signer, wallet]);

  useEffect(() => {
    if (!stream) return;
    if (!stream.active) return;
    const rate =
      typeof stream.ratePerSecond === "bigint"
        ? parseFloat(ethers.formatUnits(stream.ratePerSecond, 18))
        : parseFloat(stream.ratePerSecond);
    ratePerSecRef.current = rate;

    const tick = () => {
      setDisplayAccrued((prev) => prev + rate / 10);
      counterRef.current = requestAnimationFrame(() =>
        setTimeout(() => {
          counterRef.current = requestAnimationFrame(tick);
        }, 100),
      );
    };
    counterRef.current = requestAnimationFrame(tick);
    return () => {
      if (counterRef.current) cancelAnimationFrame(counterRef.current);
    };
  }, [stream]);

  const loadStream = async () => {
    try {
      const contract = await getContract(signer);
      const addr = await signer.getAddress();
      const s = await contract.streams(addr);
      if (s.startTime > 0n) {
        setStream(s);
        let acc;
        try {
          acc = await contract.withdrawable(addr);
        } catch {
          acc = await contract.getAccrued(addr);
        }
        const num = parseFloat(ethers.formatUnits(acc, 18));
        setAccrued(num.toFixed(6));
        setDisplayAccrued(num);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleWithdraw = async () => {
    try {
      setStatus("Withdrawing...");
      const contract = await getContract(signer);
      const tx = await contract.withdraw();
      const receipt = await tx.wait();

      const withdrawEvent = receipt.logs.find((log) => {
        try {
          return contract.interface.parseLog(log)?.name === "Withdraw";
        } catch {
          return false;
        }
      });

      let netAmount = 0;
      let taxAmount = 0;

      if (withdrawEvent) {
        const parsed = contract.interface.parseLog(withdrawEvent);
        netAmount = parseFloat(ethers.formatUnits(parsed.args.amount, 18));
        taxAmount = parseFloat(ethers.formatUnits(parsed.args.tax, 18));
        setHistory((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            gross: (netAmount + taxAmount).toFixed(4),
            tax: taxAmount.toFixed(4),
            net: netAmount.toFixed(4),
          },
          ...prev,
        ]);
      }

      if (autoInvestPercent > 0 && netAmount > 0) {
        const investAmount = (netAmount * autoInvestPercent) / 100;
        const newInvested = investedAmount + investAmount;
        const startTime = investStartTime || Date.now();
        const newHistory = [
          {
            time: new Date().toLocaleTimeString(),
            amount: investAmount.toFixed(4),
            type: "Auto-Invest",
          },
          ...investHistory,
        ];

        setInvestedAmount(newInvested);
        setInvestStartTime(startTime);
        setInvestHistory(newHistory);
        saveInvestData({
          investedAmount: newInvested,
          investStartTime: startTime,
          investHistory: newHistory,
        });
        setStatus(
          `Withdrawn! ${investAmount.toFixed(4)} HLUSD auto-invested (${autoInvestPercent}%)`,
        );
      } else {
        setStatus("Withdrawn!");
      }

      setDisplayAccrued(0);
      setTimeout(() => setStatus(""), 4000);
      loadStream();
    } catch (e) {
      setStatus(e.reason || e.message);
      setTimeout(() => setStatus(""), 4000);
    }
  };

  const getInvestmentValue = () => {
    if (!investedAmount || !investStartTime)
      return { current: 0, pnl: 0, pnlPercent: 0 };
    const elapsed = (Date.now() - investStartTime) / 1000; // seconds
    const yearsElapsed = elapsed / (365.25 * 24 * 3600);
    const currentValue =
      investedAmount * Math.pow(1 + STAKING_APY / 100, yearsElapsed);
    const pnl = currentValue - investedAmount;
    const pnlPercent = investedAmount > 0 ? (pnl / investedAmount) * 100 : 0;
    return { current: currentValue, pnl, pnlPercent };
  };

  const handleAutoInvestChange = (val) => {
    const pct = parseInt(val) || 0;
    setAutoInvestPercent(pct);
    saveInvestData({ autoInvestPercent: pct });
  };

  const monthlyRate = stream
    ? (
        parseFloat(ethers.formatUnits(stream.ratePerSecond, 18)) *
        30 *
        24 *
        3600
      ).toFixed(2)
    : "0";
  const { current: currentValue, pnl, pnlPercent } = getInvestmentValue();

  const [rampAmount, setRampAmount] = useState("");
  const [rampCurrency, setRampCurrency] = useState("USD");
  const [rampStatus, setRampStatus] = useState("");

  const tabs = [
    { id: "earnings", label: "Earnings" },
    { id: "analytics", label: "Analytics" },
    { id: "invest", label: "Invest" },
    { id: "ramp", label: "Off-Ramp" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-primary)",
        }}
      >
        <div className="max-w-3xl mx-auto flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm transition"
              style={{ color: "var(--text-muted)" }}
            >
              ← Back
            </Link>
            <span
              className="font-bold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              Employee Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={handleSwitchAccount}
              className="px-3 py-1.5 text-xs rounded-lg font-mono cursor-pointer transition-all flex items-center gap-1.5"
              style={{
                background: "var(--accent-light)",
                color: "var(--accent)",
                border: "1px solid var(--border)",
              }}
              title="Switch wallet account"
            >
              {wallet
                ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
                : "Not connected"}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all"
              style={{
                background: "var(--danger-light)",
                color: "var(--danger)",
                border: "1px solid var(--danger)",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {status && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm text-center"
            style={{
              background: "var(--accent-light)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {status}
          </div>
        )}

        {!stream ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4"></div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No Active Stream
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Your employer hasn&apos;t created a salary stream for this wallet
              yet.
            </p>
            <p
              className="text-xs mt-4 font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              {wallet}
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background:
                      activeTab === tab.id ? "var(--accent)" : "var(--bg-card)",
                    color:
                      activeTab === tab.id
                        ? "var(--text-inverse)"
                        : "var(--text-secondary)",
                    border: `1px solid ${activeTab === tab.id ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "earnings" && (
              <>
                <div className="glass-card p-8 mb-6 text-center">
                  <div
                    className="text-xs uppercase tracking-wider mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {stream.active ? (
                      <span className="flex items-center justify-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ background: "var(--success)" }}
                        ></span>
                        Earnings Accruing
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: "var(--warning)" }}
                        ></span>
                        Stream Paused
                      </span>
                    )}
                  </div>
                  <div
                    className="text-5xl md:text-6xl font-bold tracking-tight font-mono tabular-nums"
                    style={{ color: "var(--accent)" }}
                  >
                    {displayAccrued.toFixed(8)}
                  </div>
                  <div
                    className="text-sm mt-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    HLUSD
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="glass-card p-4 text-center">
                    <div
                      className="text-xs mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Monthly Rate
                    </div>
                    <div
                      className="font-bold text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {monthlyRate}
                    </div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <div
                      className="text-xs mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Tax Rate
                    </div>
                    <div
                      className="font-bold text-sm"
                      style={{ color: "var(--warning)" }}
                    >
                      {stream.taxPercent?.toString() || "0"}%
                    </div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <div
                      className="text-xs mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Status
                    </div>
                    <div
                      className="font-bold text-sm"
                      style={{
                        color: stream.active
                          ? "var(--success)"
                          : "var(--warning)",
                      }}
                    >
                      {stream.active ? "Active" : "Paused"}
                    </div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <div
                      className="text-xs mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Auto-Invest
                    </div>
                    <div
                      className="font-bold text-sm"
                      style={{
                        color:
                          autoInvestPercent > 0
                            ? "var(--accent)"
                            : "var(--text-muted)",
                      }}
                    >
                      {autoInvestPercent > 0 ? `${autoInvestPercent}%` : "Off"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={displayAccrued === 0}
                  className="w-full py-4 rounded-xl font-bold text-sm transition disabled:opacity-40 mb-8"
                  style={{
                    background: "var(--gradient-accent)",
                    color: "var(--text-inverse)",
                  }}
                >
                  Withdraw {displayAccrued.toFixed(4)} HLUSD
                  {autoInvestPercent > 0 &&
                    ` (${autoInvestPercent}% → Staking Pool)`}
                </button>

                {history.length > 0 && (
                  <div className="glass-card p-6">
                    <h3
                      className="font-bold mb-4"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Withdrawal History
                    </h3>
                    <div className="space-y-3">
                      {history.map((h, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 rounded-lg text-sm"
                          style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <span style={{ color: "var(--text-muted)" }}>
                            {h.time}
                          </span>
                          <div className="flex gap-4 text-xs">
                            <span style={{ color: "var(--text-secondary)" }}>
                              Gross: {h.gross}
                            </span>
                            <span style={{ color: "var(--danger)" }}>
                              Tax: -{h.tax}
                            </span>
                            <span
                              className="font-bold"
                              style={{ color: "var(--success)" }}
                            >
                              Net: {h.net}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "analytics" && (
              <>
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Salary Analytics
                </h3>
                <p
                  className="text-sm mb-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  Visual breakdown of your earnings & investments
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div
                    className="p-6 rounded-xl"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <DonutChart
                      title="Monthly Salary Breakdown"
                      data={[
                        {
                          label: "Net Pay",
                          value: stream
                            ? parseFloat(monthlyRate) *
                              (1 -
                                parseInt(stream.taxPercent?.toString() || "0") /
                                  100) *
                              (1 - autoInvestPercent / 100)
                            : 0,
                          color: "var(--accent)",
                        },
                        {
                          label: "Tax",
                          value: stream
                            ? parseFloat(monthlyRate) *
                              (parseInt(stream.taxPercent?.toString() || "0") /
                                100)
                            : 0,
                          color: "var(--warning)",
                        },
                        {
                          label: "Auto-Invest",
                          value: stream
                            ? parseFloat(monthlyRate) *
                              (1 -
                                parseInt(stream.taxPercent?.toString() || "0") /
                                  100) *
                              (autoInvestPercent / 100)
                            : 0,
                          color: "var(--success)",
                        },
                      ]}
                    />
                  </div>
                  <div
                    className="p-6 rounded-xl flex flex-col items-center justify-center"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="text-xs font-semibold mb-3 uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Investment Performance
                    </div>
                    <GaugeChart
                      value={pnlPercent}
                      max={STAKING_APY}
                      label={`${pnl.toFixed(4)} HLUSD earned`}
                      color={pnl >= 0 ? "var(--success)" : "var(--danger)"}
                    />
                    <div className="mt-3 text-center">
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Invested:{" "}
                        <span
                          className="font-bold"
                          style={{ color: "var(--accent)" }}
                        >
                          {investedAmount.toFixed(4)} HLUSD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {history.length > 0 && (
                  <div
                    className="p-6 rounded-xl mb-8"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <BarChart
                      title="Withdrawal History"
                      height={200}
                      data={history.slice(-10).map((h, i) => ({
                        label: h.time?.split(",")[0] || `#${i + 1}`,
                        value: parseFloat(h.net) || 0,
                        color: "var(--accent)",
                      }))}
                    />
                  </div>
                )}

                {investHistory.length > 0 && (
                  <div
                    className="p-6 rounded-xl"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <HBarChart
                      title="Investment Deposits"
                      data={investHistory.slice(-8).map((h) => ({
                        label: h.time?.split(",")[0] || "Deposit",
                        value: h.amount,
                        displayValue: `${h.amount.toFixed(4)} HLUSD`,
                        color: "var(--success)",
                      }))}
                    />
                  </div>
                )}

                {history.length === 0 && investHistory.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4"></div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No transaction data yet. Withdraw salary to see analytics.
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === "invest" && (
              <>
                <div className="glass-card p-8 mb-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        HLUSD Staking Pool
                      </h3>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Safe, low-risk yield on your salary
                      </p>
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-lg text-sm font-bold"
                      style={{
                        background: "var(--accent-light)",
                        color: "var(--accent)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {STAKING_APY}% APY
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="text-xs mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Invested
                      </div>
                      <div
                        className="text-xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {investedAmount.toFixed(2)}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        HLUSD
                      </div>
                    </div>
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="text-xs mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Current Value
                      </div>
                      <div
                        className="text-xl font-bold"
                        style={{ color: "var(--accent)" }}
                      >
                        {currentValue.toFixed(4)}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        HLUSD
                      </div>
                    </div>
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="text-xs mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        P/L
                      </div>
                      <div
                        className="text-xl font-bold"
                        style={{
                          color: pnl >= 0 ? "var(--success)" : "var(--danger)",
                        }}
                      >
                        {pnl >= 0 ? "+" : ""}
                        {pnl.toFixed(4)}
                      </div>
                      <div
                        className="text-xs"
                        style={{
                          color: pnl >= 0 ? "var(--success)" : "var(--danger)",
                        }}
                      >
                        {pnlPercent >= 0 ? "+" : ""}
                        {pnlPercent.toFixed(4)}%
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-5 rounded-xl"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Auto-Invest % of Salary
                      </span>
                      <span
                        className="text-lg font-bold font-mono px-3 py-1 rounded-lg"
                        style={{
                          background: "var(--accent-light)",
                          color: "var(--accent)",
                        }}
                      >
                        {autoInvestPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={autoInvestPercent}
                      onChange={(e) => handleAutoInvestChange(e.target.value)}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, var(--accent) ${autoInvestPercent * 2}%, var(--border) ${autoInvestPercent * 2}%)`,
                      }}
                    />
                    <div
                      className="flex justify-between text-xs mt-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                    </div>
                    <p
                      className="text-xs mt-4"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {autoInvestPercent > 0
                        ? `On each withdrawal, ${autoInvestPercent}% of your net salary will be automatically staked in the HLUSD pool at ${STAKING_APY}% APY.`
                        : "Enable auto-invest to grow your salary passively. Funds are staked upon each withdrawal."}
                    </p>
                  </div>
                </div>

                {investHistory.length > 0 && (
                  <div className="glass-card p-6">
                    <h3
                      className="font-bold mb-4"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Investment History
                    </h3>
                    <div className="space-y-3">
                      {investHistory.map((h, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 rounded-lg text-sm"
                          style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: "var(--accent-light)",
                                color: "var(--accent)",
                              }}
                            >
                              {h.type}
                            </span>
                            <span style={{ color: "var(--text-muted)" }}>
                              {h.time}
                            </span>
                          </div>
                          <span
                            className="font-bold text-sm"
                            style={{ color: "var(--accent)" }}
                          >
                            +{h.amount} HLUSD
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "ramp" && (
          <>
            <h3
              className="text-lg font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Off-Ramp
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Convert HLUSD to local currency & withdraw to bank
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {Object.entries(MOCK_RATES).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => setRampCurrency(code)}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    background:
                      rampCurrency === code
                        ? "var(--accent-light)"
                        : "var(--bg-secondary)",
                    border: `1px solid ${rampCurrency === code ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {info.name}
                  </div>
                  <div
                    className="font-bold text-sm mt-1"
                    style={{
                      color:
                        rampCurrency === code
                          ? "var(--accent)"
                          : "var(--text-primary)",
                    }}
                  >
                    1 HLUSD = {info.symbol}
                    {info.rate.toFixed(2)}
                  </div>
                  <div
                    className="text-[10px] mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {code}
                  </div>
                </button>
              ))}
            </div>

            <div className="glass-card p-8 mb-6">
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                Convert & Withdraw
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    className="text-xs mb-2 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    You Send
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={rampAmount}
                      onChange={(e) => setRampAmount(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl text-lg font-bold outline-none"
                      style={{
                        background: "var(--bg-input)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border)",
                      }}
                    />
                    <span
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold"
                      style={{ color: "var(--accent)" }}
                    >
                      HLUSD
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    className="text-xs mb-2 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    You Receive
                  </label>
                  <div
                    className="w-full px-4 py-4 rounded-xl text-lg font-bold"
                    style={{
                      background: "var(--bg-secondary)",
                      color: "var(--success)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {rampAmount
                      ? `${MOCK_RATES[rampCurrency].symbol}${(parseFloat(rampAmount) * MOCK_RATES[rampCurrency].rate).toFixed(2)}`
                      : `${MOCK_RATES[rampCurrency].symbol}0.00`}
                    <span
                      className="text-xs font-normal ml-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {rampCurrency}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-xl mb-6 text-xs space-y-2"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>
                    Exchange Rate
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    1 HLUSD = {MOCK_RATES[rampCurrency].symbol}
                    {MOCK_RATES[rampCurrency].rate.toFixed(2)} {rampCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>
                    Network Fee
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    ~0.001 HLUSD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>
                    Processing Time
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    1-2 business days
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!rampAmount || parseFloat(rampAmount) <= 0) return;
                  setRampStatus("processing");
                  setTimeout(() => {
                    setRampStatus("success");
                    setTimeout(() => setRampStatus(""), 5000);
                  }, 2000);
                }}
                disabled={
                  !rampAmount ||
                  parseFloat(rampAmount) <= 0 ||
                  rampStatus === "processing"
                }
                className="w-full py-4 rounded-xl font-bold text-sm transition disabled:opacity-40"
                style={{
                  background: "var(--gradient-accent)",
                  color: "var(--text-inverse)",
                }}
              >
                {rampStatus === "processing"
                  ? "Processing..."
                  : rampStatus === "success"
                    ? "Withdrawal Initiated!"
                    : `Withdraw to Bank (${rampCurrency})`}
              </button>
            </div>

            {rampStatus === "success" && (
              <div
                className="p-4 rounded-xl text-sm text-center"
                style={{
                  background: "var(--success-light)",
                  color: "var(--success)",
                  border: "1px solid var(--success)",
                }}
              >
                {MOCK_RATES[rampCurrency].symbol}
                {(
                  parseFloat(rampAmount) * MOCK_RATES[rampCurrency].rate
                ).toFixed(2)}{" "}
                {rampCurrency} will be deposited to your bank in 1-2 business
                days
              </div>
            )}

            <div
              className="mt-6 p-4 rounded-xl text-xs"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              <span
                className="font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                Note:
              </span>{" "}
              This is a demo ramp. In production, this integrates with MoonPay,
              Transak, or direct bank APIs to convert HLUSD to fiat.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
