import { useWallet } from '../context/WalletContext';
import LogsViewer from '../components/LogsViewer';
import '../styles.css';
export default function LogsPage() {
  const { account } = useWallet();
  
  const adminAddress = import.meta.env.VITE_ADMIN_ADDRESS?.toLowerCase();
  const isAdmin = account && adminAddress && account.toLowerCase() === adminAddress;
  
  if (!account) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>Wallet Not Connected</h2>
          <p>Please connect your wallet to access the logs.</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>Only the admin wallet can access system logs.</p>
          <p className="admin-hint">
            Admin Address: {adminAddress || 'Not configured'}
          </p>
          <p className="admin-hint">
            Your Address: {account}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <LogsViewer />
    </div>
  );
}
