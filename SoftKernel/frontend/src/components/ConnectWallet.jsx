import { useWallet } from '../context/WalletContext';

export default function ConnectWallet() {
  const { account, connecting, connectWallet, isCorrectNetwork } = useWallet();

  const truncate = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  if (account) {
    return (
      <div className="wallet-info">
        {isCorrectNetwork && <span className="wallet-dot" />}
        <span className="wallet-address">{truncate(account)}</span>
      </div>
    );
  }

  return (
    <button className="connect-btn" onClick={connectWallet} disabled={connecting}>
      {connecting ? (
        <>
          <span className="spinner" />
          Connecting...
        </>
      ) : (
        <>Connect Wallet</>
      )}
    </button>
  );
}
