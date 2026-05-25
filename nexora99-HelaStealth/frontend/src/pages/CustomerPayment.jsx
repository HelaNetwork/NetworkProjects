import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Contract, formatEther, parseEther, ZeroAddress } from "ethers";
import { QRCode } from "react-qr-code";
import { CONTRACTS, ROUTER_ABI, HUSD_ABI } from "../config";

const STATUS_MAP = ["active", "paid", "cancelled"];

export default function CustomerPayment({ wallet }) {
  const { invoiceId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlDescription = searchParams.get("desc") || "";
  const { account, signer, provider } = wallet;

  const [invoice, setInvoice]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [paying, setPaying]     = useState(false);
  const [txHash, setTxHash]     = useState(null);
  const [error, setError]       = useState(null);

  // Load invoice details from chain
  useEffect(() => {
    if (!provider || !invoiceId) {
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const router = new Contract(CONTRACTS.ROUTER, ROUTER_ABI, provider);
        const inv = await router.getInvoice(invoiceId);
        if (cancelled) return;

        // Check if invoice exists (merchant != zero address)
        if (!inv.merchant || inv.merchant === ZeroAddress) {
          setError("Invoice not found.");
          setLoading(false);
          return;
        }

        setInvoice({
          merchant: inv.merchant,
          amount:   formatEther(inv.amount),
          amountWei: inv.amount,
          status:   STATUS_MAP[Number(inv.status)] || "unknown",
          payer:    inv.payer === ZeroAddress ? null : inv.payer,
          createdAt: Number(inv.createdAt),
          paidAt:   Number(inv.paidAt) || null,
          vault:    inv.vault,  // stealth vault address
        });
      } catch (err) {
        console.error("Invoice load error:", err);
        if (!cancelled) {
          setError("Invoice not found or contracts not deployed.");
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [provider, invoiceId]);

  // Pay invoice
  const handlePay = async () => {
    if (!signer || !invoice) return;
    setPaying(true);
    setError(null);
    try {
      // Force switch to correct chain first
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xa2d08" }],  // 666888
          });
        } catch (switchErr) {
          if (switchErr.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0xa2d08",
                chainName: "HeLa Testnet",
                rpcUrls: ["https://testnet-rpc.helachain.com"],
                nativeCurrency: { name: "HLUSD", symbol: "HLUSD", decimals: 18 },
                blockExplorerUrls: ["https://testnet-blockexplorer.helachain.com"],
              }],
            });
          }
        }
        // Wait for chain switch to complete
        await new Promise(r => setTimeout(r, 1000));
      }

      // Re-create provider and signer after chain switch
      const { BrowserProvider } = await import("ethers");
      const freshProvider = new BrowserProvider(window.ethereum);
      const freshSigner = await freshProvider.getSigner();

      // Verify chain ID
      const network = await freshProvider.getNetwork();
      console.log("Connected to chain:", network.chainId.toString());
      if (network.chainId !== 666888n) {
        setError(`Wrong chain! Connected to ${network.chainId}, need 666888. Please switch to HeLa Testnet in MetaMask.`);
        setPaying(false);
        return;
      }

      const router = new Contract(CONTRACTS.ROUTER, ROUTER_ABI, freshSigner);
      const husd   = new Contract(CONTRACTS.HUSD, HUSD_ABI, freshSigner);

      // ── STEALTH VAULT FLOW ──
      // Approve HUSD spending for the VAULT address (not the router!)
      // This ensures the on-chain transfer goes: customer → vault → merchant
      const vaultAddress = invoice.vault;
      console.log("Stealth Vault address:", vaultAddress);

      console.log("Approving HUSD spend for vault", vaultAddress);
      const approveTx = await husd.approve(vaultAddress, parseEther("999999"));
      console.log("Approve tx hash:", approveTx.hash);
      await approveTx.wait();
      console.log("Approval confirmed for vault!");

      // Verify allowance on-chain
      const currentAccount = await freshSigner.getAddress();
      const allowance = await husd.allowance(currentAccount, vaultAddress);
      console.log("On-chain allowance for vault:", allowance.toString());
      if (allowance === 0n) {
        setError("Approval failed on-chain. Your MetaMask may be on the wrong network.");
        setPaying(false);
        return;
      }

      // Wait for chain state to settle
      await new Promise(r => setTimeout(r, 2000));

      // Call payInvoice — the router handles deposit() + release() atomically
      const tx = await router.payInvoice(invoiceId);
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setInvoice(prev => ({ ...prev, status: "paid", payer: currentAccount }));
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.reason || err.message);
    }
    setPaying(false);
  };

  // ── Loading ──────────────────────────────
  if (loading) {
    return (
      <div className="pay-page">
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <span className="spinner" style={{ width: 32, height: 32 }} />
          <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Loading invoice…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────
  if (error && !invoice) {
    return (
      <div className="pay-page">
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>😕</p>
          <p style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      </div>
    );
  }

  // ── No invoice loaded ────────────────────
  if (!invoice) {
    return (
      <div className="pay-page">
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>💳</p>
          <h2 style={{ marginBottom: "0.5rem" }}>Customer Payment Portal</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            This page loads when a customer receives a payment link from a merchant.
            Create an invoice from the dashboard first.
          </p>
        </div>
      </div>
    );
  }

  // Safe access — invoice is guaranteed non-null here
  const isPaid = invoice.status === "paid";

  return (
    <div className="pay-page">
      <div className="card">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="network-badge" style={{ marginBottom: "1.5rem", display: "inline-block" }}>
            HeLa Testnet
          </div>
          <p style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.5rem" }}>
            {isPaid ? "Transaction Confirmed" : "Secure Payment Request"}
          </p>
          <div className="amount-display" style={{ fontSize: "3.5rem", fontWeight: 700, margin: "1rem 0", color: "var(--text-primary)" }}>
            {invoice.amount} HUSD
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
            <span className={`badge badge-${invoice.status}`}>
              {isPaid ? "Paid" : invoice.status === "cancelled" ? "Cancelled" : "Awaiting Payment"}
            </span>
            <span className="stealth-badge">
              Stealth Protected
            </span>
          </div>
        </div>

        {/* Stepper (Request -> Payment) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "2.5rem 0", padding: "0 60px" }}>
          <div style={{ flex: 1, textAlign: "center", position: "relative" }}>
             <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--success)", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px var(--success)" }}>✓</div>
             <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Requested</span>
          </div>
          <div style={{ flex: 3, height: "2px", background: isPaid ? "var(--success)" : "rgba(255,255,255,0.1)", margin: "0 10px", position: "relative" }}>
             {/* Animated dashed line would go here in CSS */}
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
             <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isPaid ? "var(--success)" : "var(--primary)", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isPaid ? "0 0 15px var(--success)" : "0 0 15px var(--primary)" }}>{isPaid ? "✓" : "2"}</div>
             <span style={{ fontSize: "0.7rem", color: isPaid ? "var(--success)" : "var(--text-primary)" }}>Payment</span>
          </div>
        </div>

        {/* PrivacyPool Rings & QR */}
        {!isPaid && (
          <div className="qr-container" style={{ marginBottom: "2rem", background: "rgba(255,255,255,0.02)" }}>
            <div className="privacy-pool-visual">
               <div className="ring"></div>
               <div className="ring"></div>
               <div className="ring"></div>
            </div>
            <div className="qr-box">
              <QRCode value={window.location.href} size={160} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "1rem" }}>Scan with mobile wallet to pay</p>
          </div>
        )}

        {/* Invoice Details */}
        <div style={{ marginBottom: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="info-row" style={{ borderBottomColor: "rgba(255,255,255,0.05)" }}>
            <span className="info-label">Invoice ID</span>
            <span className="info-value mono" style={{ fontSize: "0.8rem" }}>
              {invoiceId.slice(0, 18)}…
            </span>
          </div>
          {urlDescription && (
            <div className="info-row" style={{ borderBottomColor: "rgba(255,255,255,0.05)" }}>
              <span className="info-label">Purpose / Desc</span>
              <span className="info-value" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {urlDescription}
              </span>
            </div>
          )}
          <div className="info-row" style={{ borderBottomColor: "rgba(255,255,255,0.05)" }}>
            <span className="info-label">Stealth Vault</span>
            <span className="info-value mono" style={{ fontSize: "0.8rem", color: "var(--primary)" }}>
              {invoice.vault && invoice.vault !== ZeroAddress
                ? `${invoice.vault.slice(0, 10)}…${invoice.vault.slice(-6)}`
                : "N/A"}
            </span>
          </div>
          <div className="info-row" style={{ borderBottomColor: "rgba(255,255,255,0.05)" }}>
            <span className="info-label">Created</span>
            <span className="info-value">
              {new Date(invoice.createdAt * 1000).toLocaleString()}
            </span>
          </div>
          {isPaid && invoice.payer && (
            <div className="info-row" style={{ borderBottom: "none" }}>
              <span className="info-label">Paid by</span>
              <span className="info-value mono" style={{ fontSize: "0.8rem", color: "var(--success)" }}>
                {invoice.payer.slice(0, 10)}…{invoice.payer.slice(-6)}
              </span>
            </div>
          )}
        </div>

        {/* Pay button */}
        {!isPaid && invoice.status === "active" && (
          <>
            {!account ? (
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={wallet.connect}>
                🔗 Connect Wallet to Pay
              </button>
            ) : (
              <button
                className="btn btn-success btn-lg"
                style={{ width: "100%" }}
                onClick={handlePay}
                disabled={paying}
              >
                {paying ? <><span className="spinner" /> Processing…</> : `💳 Pay ${invoice.amount} HUSD`}
              </button>
            )}
            {error && (
              <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.75rem", textAlign: "center" }}>{error}</p>
            )}
          </>
        )}

        {/* Success */}
        {txHash && (
          <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--success-bg)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
            <p style={{ color: "var(--success)", fontWeight: 700, marginBottom: "0.25rem" }}>🎉 Payment Successful!</p>
            <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-secondary)", wordBreak: "break-all" }}>
              TX: {txHash}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
