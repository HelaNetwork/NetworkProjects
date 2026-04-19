import { useState, useEffect } from "react";
import { loadStream, getFactory } from "../web3/wallet";
import { ethers } from "ethers";

// Extended ABI for additional contract functions
const STREAM_ABI = [
  "function withdrawableAmount() view returns (uint256)",
  "function accruedBalance() view returns (uint256)",
  "function alreadyWithdrawn() view returns (uint256)",
  "function lastUpdateTime() view returns (uint256)",
  "function monthlySalary() view returns (uint256)",
  "function status() view returns (uint8)",
  "function withdraw()",
];

function Employee({ account, userData, employeeId }) {

  const employeeName = userData?.name || "Employee";
  const employeePosition = userData?.position || "Staff Member";

  const [withdrawableBalance, setWithdrawableBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [streamRate, setStreamRate] = useState(0);
  const [currentStream, setCurrentStream] = useState(null);
  const [streamAddress, setStreamAddress] = useState("");
  
  // Blockchain-anchored state
  const [withdrawableBase, setWithdrawableBase] = useState(0);
  const [accruedBase, setAccruedBase] = useState(0);
  const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  async function loadOnchainEarnings() {
    try {
      const factory = getFactory();
      const employeeAddress = userData?.address;

      if (!employeeAddress || employeeAddress.startsWith("0xSTREAM_CONTRACT")) {
        console.warn("Employee: no valid address configured in App.jsx");
        return;
      }

      const streams = await factory.getEmployeeStreams(employeeAddress);

      if (!streams || streams.length === 0) {
        console.warn("Employee: no streams found for address:", employeeAddress);
        return;
      }

      let activeStreamAddress = null;
      for (let addr of streams) {
        const candidate = loadStream(addr);
        const status = Number(await candidate.status());
        if (status === 1) {
          activeStreamAddress = addr;
          setStreamAddress(addr);
          break;
        }
      }

      if (!activeStreamAddress) {
        console.warn("Employee: no active stream found");
        setStreamRate(0);
        return;
      }

      // Create contract with extended ABI
      const provider = factory.runner.provider || factory.runner;
      const signer = provider.getSigner ? await provider.getSigner() : factory.runner;
      const activeStream = new ethers.Contract(activeStreamAddress, STREAM_ABI, signer);
      
      setCurrentStream(activeStream);

      // Fetch all blockchain data
      const withdrawableRaw = await activeStream.withdrawableAmount();
      const accruedRaw = await activeStream.accruedBalance();
      const withdrawnRaw = await activeStream.alreadyWithdrawn();
      const monthlySalary = await activeStream.monthlySalary();
      const lastUpdateRaw = await activeStream.lastUpdateTime();

      const rate = Number(ethers.formatEther(monthlySalary)) / (30 * 24 * 60 * 60);
      const withdrawable = Number(ethers.formatEther(withdrawableRaw));
      const accrued = Number(ethers.formatEther(accruedRaw));
      const withdrawn = Number(ethers.formatEther(withdrawnRaw));
      const lastUpdate = Number(lastUpdateRaw);

      // Store blockchain anchor points
      setStreamRate(rate);
      setWithdrawableBase(withdrawable);
      setAccruedBase(accrued);
      setAlreadyWithdrawn(withdrawn);
      setLastUpdateTime(lastUpdate);

    } catch (err) {
      console.error("Employee load error:", err);
    }
  }

  useEffect(() => {
    loadOnchainEarnings();
    const refresh = setInterval(() => { loadOnchainEarnings(); }, 15000);
    return () => clearInterval(refresh);
  }, [userData]);

  // Live ticker - updates both withdrawable and total earned
  useEffect(() => {
    if (streamRate === 0 || lastUpdateTime === 0) return;
    
    const interval = setInterval(() => {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const elapsedSeconds = nowInSeconds - lastUpdateTime;
      
      // Available balance = withdrawable + newly streamed since last update
      const currentWithdrawable = withdrawableBase + (streamRate * elapsedSeconds);
      setWithdrawableBalance(currentWithdrawable);
      
      // Total earned = accrued + newly streamed + already withdrawn
      const streamedSinceUpdate = streamRate * elapsedSeconds;
      const currentTotalEarned = accruedBase + streamedSinceUpdate + alreadyWithdrawn;
      setTotalEarned(currentTotalEarned);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [streamRate, withdrawableBase, accruedBase, alreadyWithdrawn, lastUpdateTime]);

  async function withdrawAndRefresh() {
    try {
      if (!currentStream) {
        alert("No active stream loaded yet. Please wait.");
        return;
      }
      const tx = await currentStream.withdraw();
      await tx.wait();
      alert("✅ Withdrawal successful!");
      
      // Reload blockchain data immediately after withdrawal
      loadOnchainEarnings();
    } catch (err) {
      console.error("Withdraw error:", err);
      alert("Withdrawal error: " + err.message);
    }
  }

  // Calculate various time-based earnings
  const dailyEarnings = streamRate * 24 * 60 * 60;
  const weeklyEarnings = dailyEarnings * 7;
  const monthlyEarnings = streamRate * 30 * 24 * 60 * 60;
  const yearlyEarnings = monthlyEarnings * 12;

  return (
    <div className="employee-dashboard">
      
      {/* MAIN CONTENT COLUMN */}
      <div className="employee-main-content">
        
        {/* Earnings Display */}
        <div className="earnings-card">
          <div className="earnings-content">
            <div className="earnings-label">
              Your Earnings This Period
            </div>

            <div className="earnings-amount">
              {totalEarned.toFixed(8)} HLUSD
            </div>

            <div className="earnings-rate">
              Streaming at{" "}
              <strong className="rate-value">
                {streamRate.toFixed(10)} HLUSD/sec
              </strong>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="balance-card">
          <h3 className="balance-title">Available Balance</h3>

          <div className="balance-amount">
            {withdrawableBalance.toFixed(8)} HLUSD
          </div>

          <button
            className="btn btn-primary withdraw-btn"
            onClick={withdrawAndRefresh}
            disabled={!account || !currentStream}
          >
            Withdraw to HeLa Wallet
          </button>
        </div>

        {!account && (
          <div className="wallet-warning">
            ⚠️ Please connect your wallet to withdraw funds
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="stats-grid-employee">
          <div className="stat-card-employee">
            <div className="stat-label-employee">Monthly Rate</div>
            <div className="stat-value-employee">
              {(streamRate * 30 * 24 * 60 * 60).toFixed(2)}
            </div>
            <div className="stat-unit-employee">HLUSD/month</div>
          </div>

          <div className="stat-card-employee">
            <div className="stat-label-employee">Daily Rate</div>
            <div className="stat-value-employee">
              {(streamRate * 24 * 60 * 60).toFixed(4)}
            </div>
            <div className="stat-unit-employee">HLUSD/day</div>
          </div>

          <div className="stat-card-employee">
            <div className="stat-label-employee">Hourly Rate</div>
            <div className="stat-value-employee">
              {(streamRate * 60 * 60).toFixed(6)}
            </div>
            <div className="stat-unit-employee">HLUSD/hour</div>
          </div>

          <div className="stat-card-employee">
            <div className="stat-label-employee">Stream Status</div>
            <div className="stat-value-employee" style={{ 
              color: currentStream ? "var(--success)" : "var(--text-secondary)"
            }}>
              {currentStream ? "●" : "○"}
            </div>
            <div className="stat-unit-employee">
              {currentStream ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR COLUMN */}
      <div className="employee-sidebar">
        
        {/* Earnings Breakdown */}
        <div className="earnings-info-card">
          <div className="earnings-info-title">
            📊 Earnings Breakdown
          </div>
          
          <div className="earnings-info-item">
            <span className="earnings-info-label">Per Second</span>
            <span className="earnings-info-value highlight">
              {streamRate.toFixed(10)} HLUSD
            </span>
          </div>
          
          <div className="earnings-info-item">
            <span className="earnings-info-label">Per Minute</span>
            <span className="earnings-info-value">
              {(streamRate * 60).toFixed(8)} HLUSD
            </span>
          </div>
          
          <div className="earnings-info-item">
            <span className="earnings-info-label">Per Hour</span>
            <span className="earnings-info-value">
              {(streamRate * 60 * 60).toFixed(6)} HLUSD
            </span>
          </div>
          
          <div className="earnings-info-item">
            <span className="earnings-info-label">Per Day</span>
            <span className="earnings-info-value">
              {dailyEarnings.toFixed(4)} HLUSD
            </span>
          </div>
          
          <div className="earnings-info-item">
            <span className="earnings-info-label">Per Week</span>
            <span className="earnings-info-value">
              {weeklyEarnings.toFixed(4)} HLUSD
            </span>
          </div>
          
          <div className="earnings-info-item">
            <span className="earnings-info-label">Per Month</span>
            <span className="earnings-info-value">
              {monthlyEarnings.toFixed(2)} HLUSD
            </span>
          </div>
          
          <div className="earnings-info-item">
            <span className="earnings-info-label">Per Year</span>
            <span className="earnings-info-value highlight">
              {yearlyEarnings.toFixed(2)} HLUSD
            </span>
          </div>
        </div>

        {/* Stream Details */}
        {currentStream && (
          <div className="stream-details-card">
            <div className="stream-details-title">
              🔗 Stream Details
            </div>
            
            <div className="stream-detail-row">
              <div>
                <div className="stream-detail-label">Contract Address</div>
                <div className="stream-detail-value" style={{ fontSize: "11px" }}>
                  {streamAddress ? (
                    <a 
                      href={`https://testnet.helascan.io/address/${streamAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--primary)", textDecoration: "none" }}
                    >
                      {streamAddress.slice(0, 8)}...{streamAddress.slice(-6)}
                    </a>
                  ) : "—"}
                </div>
              </div>
            </div>
            
            <div className="stream-detail-row">
              <div>
                <div className="stream-detail-label">Network</div>
                <div className="stream-detail-value">HeLa Testnet</div>
              </div>
            </div>
            
            <div className="stream-detail-row">
              <div>
                <div className="stream-detail-label">Token</div>
                <div className="stream-detail-value">HLUSD</div>
              </div>
            </div>
            
            <div className="stream-detail-row">
              <div>
                <div className="stream-detail-label">Status</div>
                <div className="stream-detail-value" style={{ color: "var(--success)" }}>
                  ● Active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions-card">
          <div className="quick-actions-title">
            ⚡ Quick Actions
          </div>
          
          <button 
            className="quick-action-btn"
            onClick={withdrawAndRefresh}
            disabled={!account || !currentStream}
          >
            <span>💸</span>
            <span>Withdraw Earnings</span>
          </button>
          
          <button 
            className="quick-action-btn"
            onClick={() => window.open('https://testnet.helascan.io', '_blank')}
          >
            <span>🔍</span>
            <span>View on Explorer</span>
          </button>
          
          <button 
            className="quick-action-btn"
            onClick={loadOnchainEarnings}
          >
            <span>🔄</span>
            <span>Refresh Data</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default Employee;