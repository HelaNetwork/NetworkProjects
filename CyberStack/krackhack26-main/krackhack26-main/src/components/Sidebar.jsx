function Sidebar({ role, userData }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">⚡</span>
        <h2>PayStream</h2>
      </div>

      {/* User Info Card - IMPROVED */}
      {userData && (
        <div style={{
          padding: "20px",
          background: "var(--bg-elevated)",
          borderRadius: "14px",
          marginBottom: "8px",
          border: "1px solid var(--border)",
          transition: "all 0.3s ease"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "12px",
            background: "var(--gradient-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "700",
            color: "var(--bg-dark)",
            margin: "0 auto 16px",
            boxShadow: "0 4px 12px rgba(0, 217, 255, 0.3)"
          }}>
            {userData.name?.charAt(0) || "U"}
          </div>
          <div style={{ textAlign: "center", fontSize: "14px" }}>
            <div style={{ 
              fontWeight: "700", 
              marginBottom: "6px",
              fontSize: "15px" 
            }}>
              {userData.name || "User"}
            </div>
            <div style={{ 
              color: "var(--text-secondary)", 
              fontSize: "12px",
              letterSpacing: "0.3px"
            }}>
              {role === "hr" ? "HR Manager" : userData.position}
            </div>
          </div>
        </div>
      )}

      {/* Current Portal Display */}
      <div className="sidebar-nav">
        <div 
          style={{
            padding: "14px 18px",
            background: "linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(123, 47, 255, 0.15) 100%)",
            borderRadius: "12px",
            border: "2px solid var(--primary)",
            color: "var(--text-primary)",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "16px",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(0, 217, 255, 0.2)"
          }}
        >
          {role === "hr" ? "🏢 HR Dashboard" : "👤 Employee Portal"}
        </div>
        
        <div style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          textAlign: "center",
          padding: "12px 16px",
          lineHeight: "1.6",
          background: "rgba(0, 217, 255, 0.03)",
          borderRadius: "10px",
          border: "1px solid var(--border)"
        }}>
          {role === "hr" 
            ? "Managing payroll & employee streams"
            : "Viewing your earnings & payments"}
        </div>
      </div>

      {/* Network Info at Bottom */}
      <div style={{ 
        marginTop: "auto", 
        paddingTop: "24px", 
        borderTop: "1px solid var(--border)" 
      }}>
        <div style={{ 
          fontSize: "11px", 
          color: "var(--text-secondary)",
          lineHeight: "1.7"
        }}>
          <div style={{ 
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--success)",
              animation: "pulse 2s ease-in-out infinite"
            }}></div>
            <strong style={{ 
              color: "var(--text-primary)",
              fontSize: "12px"
            }}>Network:</strong> 
            <span style={{ fontSize: "12px" }}>HeLa Testnet</span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--primary)"
            }}></div>
            <strong style={{ 
              color: "var(--text-primary)",
              fontSize: "12px"
            }}>Token:</strong> 
            <span style={{ fontSize: "12px" }}>HLUSD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;