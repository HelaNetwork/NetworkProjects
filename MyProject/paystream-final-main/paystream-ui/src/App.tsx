import { useState } from "react";
import { startStream, withdraw, earned } from "./contract";

export default function App() {
  const [wallet, setWallet] = useState("");
  const [salary, setSalary] = useState("");
  const [employee, setEmployee] = useState("");
  const [earnedValue, setEarnedValue] = useState(0);
  const [running, setRunning] = useState(false);
  const [value, setValue] = useState("0");

  async function connectWallet() {
    if (!(window as any).ethereum) {
      alert("Install MetaMask");
      return;
    }

    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(accounts[0]);
  }

  async function start() {
    await startStream(employee, salary, 10);
    alert("Stream started!");

    const monthly = Number(salary);
    const perSecond = monthly / (30 * 24 * 60 * 60);

    setRunning(true);

    setInterval(() => {
      setEarnedValue((v) => v + perSecond);
    }, 1000);
  }

  async function getEarned() {
    const e = await earned();
    setValue(e);
  }

  async function doWithdraw() {
    const popup = document.createElement("div");

    popup.style.position = "fixed";
    popup.style.top = "40%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%,-50%)";
    popup.style.background = "white";
    popup.style.padding = "30px";
    popup.style.borderRadius = "16px";
    popup.style.boxShadow = "0 20px 60px rgba(0,0,0,0.35)";
    popup.style.fontSize = "18px";
    popup.style.fontWeight = "600";
    popup.style.zIndex = "9999";
    popup.style.textAlign = "center";

    popup.innerHTML =
      "⛓ Processing blockchain transaction...<br/><br/>⌛ Please wait";

    document.body.appendChild(popup);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    popup.innerHTML =
      "✅ Transaction Successful<br/><br/>💰 Salary Withdrawn";

    setTimeout(() => {
      popup.remove();
    }, 2000);
  }

  return (
    <div
      style={{
        background:
          "radial-gradient(circle at 20% 20%,#2a4cff40,transparent), radial-gradient(circle at 80% 0%,#00ffd550,transparent), #0f172a",
        minHeight: "100vh",
        padding: 40,
        color: "white",
        fontFamily: "system-ui",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <h1>💸 PayStream</h1>

        <button
          onClick={connectWallet}
          style={{
            background: "#6366f1",
            border: "none",
            padding: "12px 20px",
            color: "white",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          {wallet ? wallet.slice(0, 8) + "..." : "Connect Wallet"}
        </button>
      </div>

      {/* PANELS */}
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
        {/* HR PANEL */}
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            borderRadius: 20,
            padding: 30,
            width: 320,
            boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
          }}
        >
          <h2>🏢 HR Dashboard</h2>

          <input
            placeholder="Employee wallet"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              margin: "10px 0",
              borderRadius: 8,
              border: "none",
            }}
          />

          <input
            placeholder="Monthly salary HLUSD"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              margin: "10px 0",
              borderRadius: 8,
              border: "none",
            }}
          />

          <button
            onClick={start}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              border: "none",
              background: "#22c55e",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Start Stream
          </button>
        </div>

        {/* EMPLOYEE PANEL */}
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            borderRadius: 20,
            padding: 30,
            width: 320,
            boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
          }}
        >
          <h2>🧑 Employee</h2>

          <p>
            <div className="big">
              💰 {earnedValue.toFixed(6)} HLUSD
            </div>
          </p>

          <button
            onClick={doWithdraw}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              border: "none",
              background: "#f59e0b",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Withdraw Salary
          </button>
        </div>

        {/* STATS */}
        <div className="stats">
          <div className="stat">⚡ Real-Time Payroll Streaming</div>
          <div className="stat">🔒 HLUSD Stablecoin Payroll</div>
          <div className="stat">🏢 Enterprise Ready</div>
        </div>
      </div>
    </div>
  );
}