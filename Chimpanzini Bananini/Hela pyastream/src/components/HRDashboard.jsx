import { useState, useRef, useEffect } from "react";
import { getContract, getEthBalance } from "../utils/contract";
import { ethers } from "ethers";

// Typing animation for live text
const LIVE_TEXT = "ready to disburse salary...";

function useTypingLoop(text, speed = 80, pause = 900) {
  const [display, setDisplay] = useState("");
  const [dir, setDir] = useState(1); // 1: typing, -1: erasing
  const idx = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      if (dir === 1) {
        if (idx.current < text.length) {
          setDisplay(text.slice(0, idx.current + 1));
          idx.current++;
        } else {
          setDir(-1);
          setTimeout(() => {}, pause);
        }
      } else {
        if (idx.current > 0) {
          setDisplay(text.slice(0, idx.current - 1));
          idx.current--;
        } else {
          setDir(1);
        }
      }
    }, dir === 1 ? speed : 30);
    return () => clearInterval(interval);
  }, [dir, text, speed, pause]);
  return display;
}


export default function HRDashboard({ account }) {
  const [treasury, setTreasury] = useState("0");
  const [emp, setEmp] = useState("0xa0a0bEE383d468658Aa01a61bB5BC2AEf1D195C6");
  const [rate, setRate] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);
  const [ethBalance, setEthBalance] = useState("0");
  const employeeList = [
    "0xa0a0bEE383d468658Aa01a61bB5BC2AEf1D195C6",
    "0xfCAe89f40e178eF7ebAeb45AD8450432D3aC6C41",
    "0xf0567A0c85a19DBFB1bA52911f0eBf095619100f"
  ];
  const liveText = useTypingLoop(LIVE_TEXT);

  async function loadEthBalance() {
    if (account) {
      const bal = await getEthBalance(account);
      setEthBalance(bal);
    }
  }

  useEffect(() => {
    loadEthBalance();
  }, [account]);

  async function loadTreasury() {
    const c = await getContract();
    const bal = await c.treasuryBalance();
    setTreasury(ethers.formatEther(bal));
  }

  async function deposit() {
    const c = await getContract();
    const tx = await c.depositFunds({
      value: ethers.parseEther("0.02")
    });
    await tx.wait();
    loadTreasury();
    loadEthBalance();
  }

  async function startStream() {
    const c = await getContract();
    const tx = await c.startStream(
      emp,
      ethers.parseUnits(rate, "wei"),
      { value: ethers.parseEther(maxSalary || "0.01") }
    );
    await tx.wait();
    setStreaming(true);
    setStreamProgress(0);
    loadEthBalance();
    // Simulate stream fill (10s for demo)
    let prog = 0;
    const interval = setInterval(() => {
      prog += 2;
      setStreamProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setStreaming(false);
      }
    }, 200);
  }

  return (
    <div className="dashboard-outer">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-live-text">{liveText}&nbsp;</div>
            <div className="dashboard-eth-balance">Balance: Ξ {Number(ethBalance).toFixed(4)}</div>
          </div>
          <div className="dashboard-account-badge">{account?.slice(0,6)}...{account?.slice(-4)}</div>
        </div>
        <h2>HR Dashboard</h2>
        <div className="card dashboard-section">
          <div className="dashboard-row">
            <span>Treasury: {treasury}</span>
            <div className="dashboard-btns">
              <button className="btn btn-blue" onClick={loadTreasury}>Refresh Treasury</button>
              <button className="btn btn-green" onClick={deposit}>Deposit 0.02</button>
            </div>
          </div>
        </div>
        <div className="card dashboard-section">
          <h3>Manage Employee Stream</h3>
          <div className="dashboard-row">
            <select value={emp} onChange={e=>setEmp(e.target.value)} style={{minWidth: 220, padding: 8, borderRadius: 8}}>
              {employeeList.length === 0 && <option value="">No employees found</option>}
              {employeeList.map(addr => (
                <option key={addr} value={addr}>{addr.slice(0,6)}...{addr.slice(-4)}</option>
              ))}
            </select>
            <input placeholder="Rate per sec (wei)" onChange={e=>setRate(e.target.value)} />
            <input placeholder="Max Salary (ETH)" onChange={e=>setMaxSalary(e.target.value)} />
            <button className="btn btn-purple" onClick={startStream} disabled={!emp}>Start Stream</button>
          </div>
          {streaming && (
            <div className="stream-progress-outer">
              <div className="stream-progress-bar" style={{width: streamProgress + '%'}}></div>
              <span className="stream-progress-label">Streaming... {streamProgress}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
