import { Link } from "react-router-dom";

export default function Layout({ children }: any) {
  const linkStyle = {
    padding:"14px",
    borderRadius:"10px",
    background:"#374151",
    color:"white",
    textDecoration:"none",
    textAlign:"center" as const,
    fontWeight:600
  };

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>

      {/* SIDEBAR */}
      <div style={{
        width:260,
        background:"#1f2937",
        padding:25,
        color:"white"
      }}>

        <h2 style={{marginBottom:30}}>💸 PayStream</h2>

        <div style={{display:"flex",flexDirection:"column",gap:15}}>

          <Link to="/" style={linkStyle}>🏠 Home</Link>

          <Link to="/hr" style={linkStyle}>🏢 HR Panel</Link>

          <Link to="/employee" style={linkStyle}>👨‍💻 Employee</Link>

        </div>

      </div>

      {/* MAIN CONTENT */}
      <div style={{
        flex:1,
        padding:40,
        background:"#f9fafb"   // ⭐ THIS FIXES DARK HR PAGE
      }}>
        {children}
      </div>

    </div>
  );
}
