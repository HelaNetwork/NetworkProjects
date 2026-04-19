export default function WalletConnect({ setAccount }) {
  async function connect() {
    const acc = await window.ethereum.request({
      method: "eth_requestAccounts"
    });
    setAccount(acc[0]);
  }

  return (
    <button className="btn btn-green homepage-connect-btn" onClick={connect}>
      Connect MetaMask
    </button>
  );
}
