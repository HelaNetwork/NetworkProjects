import { useEffect, useState } from "react";
import { getContract, getEthBalance } from "../utils/contract";
import { ethers } from "ethers";

// Celebration popup
function Celebration({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="celebration-popup">
      <div className="celebration-content">
        🎉 Salary Claimed! 🎉
        <button className="btn btn-green" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function EmployeeDashboard({ account }) {

  const [avail, setAvail] = useState("0");
  const [showCelebration, setShowCelebration] = useState(false);
  const [ethBalance, setEthBalance] = useState("0");

  async function loadEthBalance() {
    if (account) {
      const bal = await getEthBalance(account);
      setEthBalance(bal);
    }
  }

  async function load() {
    if (!account) return;
    const c = await getContract();
    const a = await c.availableToClaim(account);
    setAvail(ethers.formatEther(a));
  }

  async function claim() {
    const c = await getContract();
    const tx = await c.claim();
    await tx.wait();
    await load();
    await loadEthBalance();
    setShowCelebration(true);
  }

  useEffect(() => {
    if (!account) return;

    load();
    loadEthBalance();

    const t = setInterval(() => {
      load();
      loadEthBalance();
    }, 2000);

    return () => clearInterval(t);
  }, [account]);

  return (
    <div className="dashboard-outer">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-static-text">
              it's salary time yay!!
            </div>
            <div className="dashboard-eth-balance">
              Balance: Ξ {Number(ethBalance).toFixed(4)}
            </div>
          </div>

          <div className="dashboard-account-badge">
            {account?.slice(0,6)}...{account?.slice(-4)}
          </div>
        </div>

        <h2>Employee Dashboard</h2>

        <div className="card dashboard-section">
          <div className="dashboard-row">
            <span>Available: {avail}</span>
            <button className="btn btn-green" onClick={claim}>
              Claim Salary
            </button>
          </div>
        </div>

        <Celebration
          show={showCelebration}
          onClose={() => setShowCelebration(false)}
        />
      </div>
    </div>
  );
}
