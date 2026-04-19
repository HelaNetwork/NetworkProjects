"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import {
  getContract,
  formatHLUSD,
  parseHLUSD,
  ensureHelaNetwork,
  disconnectWallet,
  CONTRACT_ADDRESS,
} from "@/utils/contract";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DonutChart,
  BarChart,
  HBarChart,
  GaugeChart,
} from "@/components/Charts";
import Link from "next/link";

export default function HRDashboard() {
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const [signer, setSigner] = useState(null);
  const [treasuryBalance, setTreasuryBalance] = useState("0");
  const [taxVault, setTaxVault] = useState("0");
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState("deposit");
  const [yieldAccrued, setYieldAccrued] = useState("0");
  const [totalBonuses, setTotalBonuses] = useState("0");

  const [depositAmount, setDepositAmount] = useState("");
  const [empAddress, setEmpAddress] = useState("");
  const [empRate, setEmpRate] = useState("");
  const [empTax, setEmpTax] = useState("10");
  const [pauseAddress, setPauseAddress] = useState("");
  const [bonusAddress, setBonusAddress] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusReason, setBonusReason] = useState("");

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
      } else {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const s = await provider.getSigner();
        setSigner(s);
        setWallet(await s.getAddress());
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
    setEmployees([]);
    setTreasuryBalance("0");
    setTaxVault("0");
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
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [signer, wallet]);

  const loadData = async () => {
    try {
      const contract = await getContract(signer);

      const treasury = await contract.treasuryBalance();
      const tax = await contract.taxVaultBalance();
      setTreasuryBalance(formatHLUSD(treasury));
      setTaxVault(formatHLUSD(tax));

      setYieldAccrued("0.0000");
      setTotalBonuses("0.0000");
      const count = await contract.getEmployeeCount();
      const empAddresses = [];
      for (let i = 0; i < Number(count); i++) {
        const addr = await contract.employees(i);
        empAddresses.push(addr);
      }

      const details = await Promise.all(
        empAddresses.map(async (addr) => {
          const stream = await contract.streams(addr);
          const accrued = await contract.getAccrued(addr);
          return {
            address: addr,
            rate: ethers.formatUnits(stream.ratePerSecond, 18),
            tax: stream.taxPercent.toString(),
            active: stream.active,
            exists: stream.startTime > 0n,
            accrued: formatHLUSD(accrued),
          };
        }),
      );
      setEmployees(details.filter((e) => e.exists));
    } catch (e) {
      console.error("loadData error:", e);
    }
  };

  const showStatus = (msg, duration = 4000) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), duration);
  };

  const handleDeposit = async () => {
    if (!depositAmount || !signer) return;
    try {
      const amountWei = ethers.parseEther(depositAmount.toString());
      const signerAddress = await signer.getAddress();

      const provider = signer.provider;
      const balance = await provider.getBalance(signerAddress);

      if (balance < amountWei) {
        showStatus(
          "Insufficient HLUSD balance. You have " +
            parseFloat(ethers.formatEther(balance)).toFixed(4) +
            " HLUSD, need " +
            depositAmount,
        );
        return;
      }

      const contract = await getContract(signer);
      const owner = await contract.owner();
      if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
        showStatus(
          "Only the contract owner (HR) can deposit. Connected: " +
            signerAddress.slice(0, 10) +
            "... Owner: " +
            owner.slice(0, 10) +
            "...",
        );
        return;
      }

      showStatus("Depositing HLUSD to treasury...");
      const tx = await contract.deposit({ value: amountWei });
      await tx.wait();

      showStatus("Deposit successful!");
      setDepositAmount("");
      loadData();
    } catch (error) {
      const msg =
        error.reason || error.shortMessage || error.message || "Unknown error";
      showStatus("Deposit failed: " + msg, 8000);
    }
  };

  const handleCreateStream = async () => {
    if (!empAddress || !empRate || !signer) return;
    try {
      showStatus("Creating stream...");
      const contract = await getContract(signer);
      const ratePerSec = parseHLUSD(
        (parseFloat(empRate) / (30 * 24 * 3600)).toFixed(18),
      );
      const tx = await contract.createStream(
        empAddress,
        ratePerSec,
        parseInt(empTax),
      );
      await tx.wait();
      showStatus("Stream created!");
      setEmpAddress("");
      setEmpRate("");
      setEmpTax("10");
      loadData();
    } catch (e) {
      showStatus(e.reason || e.message);
    }
  };

  const handlePause = async (addr) => {
    try {
      showStatus("Pausing...");
      const contract = await getContract(signer);
      const tx = await contract.pauseStream(addr);
      await tx.wait();
      showStatus("Paused");
      loadData();
    } catch (e) {
      showStatus(e.reason || e.message);
    }
  };

  const handleResume = async (addr) => {
    try {
      showStatus("Resuming...");
      const contract = await getContract(signer);
      const tx = await contract.resumeStream(addr);
      await tx.wait();
      showStatus("Resumed");
      loadData();
    } catch (e) {
      showStatus(e.reason || e.message);
    }
  };

  const handleCancel = async (addr) => {
    if (!confirm(`Cancel stream for ${addr}?`)) return;
    try {
      showStatus("Cancelling...");
      const contract = await getContract(signer);
      const tx = await contract.cancelStream(addr);
      await tx.wait();
      showStatus("Cancelled");
      loadData();
    } catch (e) {
      showStatus(e.reason || e.message);
    }
  };

  const handleWithdrawTax = async () => {
    try {
      showStatus("Withdrawing tax...");
      const contract = await getContract(signer);
      const tx = await contract.withdrawTax();
      await tx.wait();
      showStatus("Tax withdrawn!");
      loadData();
    } catch (e) {
      showStatus(e.reason || e.message);
    }
  };

  const handleSendBonus = async () => {
    if (!bonusAddress || !bonusAmount || !signer) return;
    try {
      showStatus("Sending bonus...");
      const contract = await getContract(signer);
      const amount = parseHLUSD(bonusAmount);
      const tx = await contract.triggerBonus(bonusAddress, amount);
      await tx.wait();
      showStatus(`Bonus of ${bonusAmount} HLUSD sent!`);
      setBonusAddress("");
      setBonusAmount("");
      setBonusReason("");
      loadData();
    } catch (e) {
      showStatus(e.reason || e.message);
    }
  };

  const tabs = [
    { id: "deposit", label: "Deposit" },
    { id: "create", label: "Create Stream" },
    { id: "bonus", label: "Bonuses" },
    { id: "monitor", label: "Employees" },
    { id: "analytics", label: "Analytics" },
    { id: "tax", label: "Tax Vault" },
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
        <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-3">
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
              HR Dashboard
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        {status && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm text-center transition-all"
            style={{
              background: "var(--accent-light)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {status}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Treasury Balance
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              {treasuryBalance}{" "}
              <span
                className="text-sm font-normal"
                style={{ color: "var(--text-muted)" }}
              >
                HLUSD
              </span>
            </div>
          </div>
          <div className="glass-card p-5">
            <div
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Treasury Yield (3% APY)
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--success)" }}
            >
              {yieldAccrued}{" "}
              <span
                className="text-sm font-normal"
                style={{ color: "var(--text-muted)" }}
              >
                HLUSD
              </span>
            </div>
          </div>
          <div className="glass-card p-5">
            <div
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Tax Vault
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--warning)" }}
            >
              {taxVault}{" "}
              <span
                className="text-sm font-normal"
                style={{ color: "var(--text-muted)" }}
              >
                HLUSD
              </span>
            </div>
          </div>
          <div className="glass-card p-5">
            <div
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Active Streams
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--success)" }}
            >
              {employees.filter((e) => e.active).length}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
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

        <div className="glass-card p-8">
          {activeTab === "deposit" && (
            <div className="max-w-md">
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Deposit HLUSD
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--text-muted)" }}
              >
                Fund the treasury to start streaming salaries
              </p>
              <input
                type="number"
                placeholder="Amount (HLUSD)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm mb-4 outline-none transition"
                style={{
                  background: "var(--bg-input)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
              />
              <button
                onClick={handleDeposit}
                className="w-full py-3 rounded-xl font-semibold text-sm transition"
                style={{
                  background: "var(--gradient-accent)",
                  color: "var(--text-inverse)",
                }}
              >
                Deposit to Treasury
              </button>
            </div>
          )}

          {activeTab === "create" && (
            <div className="max-w-md">
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Create Salary Stream
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--text-muted)" }}
              >
                Set up a new recurring salary stream for an employee
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Employee wallet address (0x...)"
                  value={empAddress}
                  onChange={(e) => setEmpAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
                />
                <input
                  type="number"
                  placeholder="Monthly salary (HLUSD)"
                  value={empRate}
                  onChange={(e) => setEmpRate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
                />
                <div>
                  <label
                    className="text-xs mb-1 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Tax Percentage
                  </label>
                  <input
                    type="number"
                    placeholder="Tax %"
                    min="0"
                    max="100"
                    value={empTax}
                    onChange={(e) => setEmpTax(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--bg-input)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                  />
                </div>
                <button
                  onClick={handleCreateStream}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition"
                  style={{
                    background: "var(--gradient-accent)",
                    color: "var(--text-inverse)",
                  }}
                >
                  Create Stream
                </button>
              </div>
            </div>
          )}

          {activeTab === "bonus" && (
            <div className="max-w-md">
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Send Bonus
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--text-muted)" }}
              >
                One-time performance bonus from treasury
              </p>

              <div
                className="p-5 rounded-xl mb-6"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-muted)" }}>
                    Total Bonuses Paid
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    {totalBonuses} HLUSD
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--text-muted)" }}>
                    Available in Treasury
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: "var(--success)" }}
                  >
                    {treasuryBalance} HLUSD
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="text-xs mb-1 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Employee Address
                  </label>
                  <select
                    value={bonusAddress}
                    onChange={(e) => setBonusAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--bg-input)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <option value="">Select employee...</option>
                    {employees.map((emp, i) => (
                      <option key={i} value={emp.address}>
                        {`${emp.address.slice(0, 6)}...${emp.address.slice(-4)}`}{" "}
                        {emp.active ? "(Active)" : "(Paused)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="text-xs mb-1 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Or paste address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={bonusAddress}
                    onChange={(e) => setBonusAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--bg-input)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                  />
                </div>
                <input
                  type="number"
                  placeholder="Bonus amount (HLUSD)"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Reason (e.g., Q4 Performance)"
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
                />
                <button
                  onClick={handleSendBonus}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition"
                  style={{
                    background: "var(--gradient-accent)",
                    color: "var(--text-inverse)",
                  }}
                  disabled={!bonusAddress || !bonusAmount}
                >
                  Send Bonus
                </button>
              </div>
            </div>
          )}

          {activeTab === "monitor" && (
            <div>
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Employee Streams
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--text-muted)" }}
              >
                Manage all active and paused streams
              </p>
              {employees.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4"></div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No employees yet. Create a stream to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employees.map((emp, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-mono text-sm truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {emp.address}
                        </div>
                        <div
                          className="flex gap-4 mt-1 text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <span>
                            Rate: {parseFloat(emp.rate).toFixed(8)}/sec
                          </span>
                          <span>Tax: {emp.tax}%</span>
                          <span>
                            Accrued: {parseFloat(emp.accrued).toFixed(4)} HLUSD
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: emp.active
                              ? "var(--success-light)"
                              : "var(--warning-light)",
                            color: emp.active
                              ? "var(--success)"
                              : "var(--warning)",
                          }}
                        >
                          {emp.active ? "Active" : "Paused"}
                        </span>
                        {emp.active ? (
                          <button
                            onClick={() => handlePause(emp.address)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{
                              background: "var(--warning-light)",
                              color: "var(--warning)",
                              border: "1px solid var(--warning)",
                            }}
                          >
                            Pause
                          </button>
                        ) : (
                          <button
                            onClick={() => handleResume(emp.address)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{
                              background: "var(--success-light)",
                              color: "var(--success)",
                              border: "1px solid var(--success)",
                            }}
                          >
                            Resume
                          </button>
                        )}
                        <button
                          onClick={() => handleCancel(emp.address)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            background: "var(--danger-light)",
                            color: "var(--danger)",
                            border: "1px solid var(--danger)",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Payroll Analytics
              </h3>
              <p
                className="text-sm mb-8"
                style={{ color: "var(--text-muted)" }}
              >
                Visual overview of your payroll operations
              </p>

              {employees.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4"></div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No data yet. Create streams to see analytics.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div
                      className="p-6 rounded-xl"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <DonutChart
                        title="Stream Status"
                        data={[
                          {
                            label: "Active",
                            value: employees.filter((e) => e.active).length,
                            color: "var(--success)",
                          },
                          {
                            label: "Paused",
                            value: employees.filter((e) => !e.active).length,
                            color: "var(--warning)",
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
                        Treasury Utilization
                      </div>
                      <GaugeChart
                        value={(() => {
                          const totalMonthly = employees
                            .filter((e) => e.active)
                            .reduce(
                              (sum, e) =>
                                sum + parseFloat(e.rate) * 30 * 24 * 3600,
                              0,
                            );
                          const treasury = parseFloat(treasuryBalance);
                          return treasury > 0
                            ? (totalMonthly / treasury) * 100
                            : 0;
                        })()}
                        max={100}
                        label="Monthly Burn Rate"
                        color="var(--accent)"
                      />
                      <div className="mt-3 text-center">
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Treasury:{" "}
                          <span
                            className="font-bold"
                            style={{ color: "var(--accent)" }}
                          >
                            {treasuryBalance} HLUSD
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-6 rounded-xl mb-8"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <BarChart
                      title="Monthly Salary by Employee"
                      height={220}
                      data={employees.map((emp, i) => ({
                        label: `${emp.address.slice(0, 6)}...${emp.address.slice(-3)}`,
                        value: parseFloat(emp.rate) * 30 * 24 * 3600,
                        color: emp.active
                          ? "var(--accent)"
                          : "var(--text-muted)",
                      }))}
                    />
                  </div>

                  <div
                    className="p-6 rounded-xl mb-8"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <HBarChart
                      title="Accrued Salary (Pending Withdrawal)"
                      data={employees.map((emp) => ({
                        label: `${emp.address.slice(0, 6)}...${emp.address.slice(-4)}`,
                        value: parseFloat(emp.accrued),
                        displayValue: `${parseFloat(emp.accrued).toFixed(4)} HLUSD`,
                        color: emp.active ? "var(--accent)" : "var(--warning)",
                      }))}
                    />
                  </div>

                  <div
                    className="p-6 rounded-xl"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <DonutChart
                      title="Tax vs Net Distribution"
                      data={[
                        {
                          label: "Tax Vault",
                          value: parseFloat(taxVault),
                          color: "var(--warning)",
                        },
                        {
                          label: "Net Paid",
                          value: Math.max(0, parseFloat(treasuryBalance)),
                          color: "var(--accent)",
                        },
                      ]}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "tax" && (
            <div className="max-w-md">
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Tax Vault
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--text-muted)" }}
              >
                Withdraw accumulated tax to owner wallet
              </p>
              <div
                className="p-6 rounded-xl mb-6 text-center"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Available to Withdraw
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: "var(--warning)" }}
                >
                  {taxVault} HLUSD
                </div>
              </div>
              <button
                onClick={handleWithdrawTax}
                className="w-full py-3 rounded-xl font-semibold text-sm transition"
                style={{
                  background: "var(--gradient-accent)",
                  color: "var(--text-inverse)",
                }}
                disabled={parseFloat(taxVault) === 0}
              >
                Withdraw Tax
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
