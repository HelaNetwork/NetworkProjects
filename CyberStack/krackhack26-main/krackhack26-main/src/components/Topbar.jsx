function Topbar({ email, account, connectWallet, role, userData }) {
  const getInitials = (email) => {
    return email.charAt(0).toUpperCase();
  };

  const getRoleDisplay = (role, userData) => {
    if (role === "hr") return "HR Manager";
    if (userData?.position) return userData.position;
    return "Employee";
  };

  const getUserDisplayName = (userData, email) => {
    if (userData?.name) return userData.name;
    return email.split('@')[0];
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>{role === "hr" ? "HR Dashboard" : "My Dashboard"}</h1>
        <div className="topbar-subtitle">
          {role === "hr" 
            ? "Manage salary streams and employee payroll"
            : `Welcome back, ${getUserDisplayName(userData, email).split(' ')[0]}`}
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-user">
          <div className="topbar-user-avatar">
            {userData?.name ? userData.name.charAt(0) : getInitials(email)}
          </div>
          <div className="topbar-user-info">
            <div className="topbar-user-email">
              {getUserDisplayName(userData, email)}
            </div>
            <div className="topbar-user-role">
              {getRoleDisplay(role, userData)}
            </div>
          </div>
        </div>

        {account ? (
          <button className="wallet-btn connected">
            <span className="wallet-dot"></span>
            {formatAddress(account)}
          </button>
        ) : (
          <button className="wallet-btn" onClick={connectWallet}>
            🔗 Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default Topbar;