import { useEffect, useState } from "react";
import WalletConnect from "./components/WalletConnect";
import HRDashboard from "./components/HRDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import { getContract } from "./utils/contract";
import "./styles.css";

export default function App() {
  const [account, setAccount] = useState(null);
  const [owner, setOwner] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account) return;
    checkOwner();
  }, [account]);

  async function checkOwner() {
    try {
      const c = await getContract();
      const o = await c.owner();
      setOwner(o.toLowerCase());
    } catch (err) {
      setError("Could not connect to contract. Please check your network and contract deployment.");
    }
  }

  // Check for Metamask
  if (typeof window.ethereum === "undefined") {
    return (
      <div className="homepage-bg">
        <div className="homepage-overlay">
          <div className="homepage-center">
            <h1 className="homepage-title">
              Schedule autopayments with <span className="brand">Hottiepayz</span> without any hussle
            </h1>
            <div style={{color: '#ff6e6e', fontWeight: 600, marginTop: 32, fontSize: '1.2rem'}}>
              Please install MetaMask to use this app.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage-bg">
        <div className="homepage-overlay">
          <div className="homepage-center">
            <h1 className="homepage-title">
              Schedule autopayments with <span className="brand">Hottiepayz</span> without any hussle
            </h1>
            <div style={{color: '#ff6e6e', fontWeight: 600, marginTop: 32, fontSize: '1.2rem'}}>
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!account)
    return (
      <div className="homepage-bg">
        <div className="homepage-overlay">
          <div className="homepage-center">
            <h1 className="homepage-title">
              Schedule autopayments with <span className="brand">Hottiepayz</span> without any hussle
            </h1>
            <WalletConnect setAccount={setAccount} />
          </div>
        </div>
      </div>
    );

  if (account.toLowerCase() === owner)
    return <HRDashboard account={account} />;

  return <EmployeeDashboard account={account} />;
}
