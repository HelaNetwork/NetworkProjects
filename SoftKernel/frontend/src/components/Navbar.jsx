import { NavLink, Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { PrecisionToggle } from '../context/DecimalContext';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
  const { account } = useWallet();
  const adminAddress = import.meta.env.VITE_ADMIN_ADDRESS?.toLowerCase();
  const isAdmin = account && adminAddress && account.toLowerCase() === adminAddress;
  
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-logo">PS</span>
        <span className="navbar-title">PayStream</span>
      </Link>

      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
        <NavLink to="/company" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
          Company
        </NavLink>
        <NavLink to="/hr" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
          HR
        </NavLink>
        <NavLink to="/employee" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
          Employee
        </NavLink>
        {isAdmin && (
          <NavLink to="/logs" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Logs
          </NavLink>
        )}
      </div>

      <div className="navbar-right">
        <PrecisionToggle />
        <ConnectWallet />
      </div>
    </nav>
  );
}
