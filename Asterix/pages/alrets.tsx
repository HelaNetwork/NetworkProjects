// AlertsPage (from your code)
const AlertsPage = ({ crisis, alerts, setAlerts }) => {
  const [filter,setFilter]=useState("ALL");
  const sevs=["ALL","CRITICAL","HIGH","MEDIUM","LOW"];

  const sevStyle = s => ({
    CRITICAL:{c:"var(--crimson)",bg:"rgba(255,23,68,.08)",br:"rgba(255,23,68,.3)"},
    HIGH:    {c:"var(--red)",   bg:"rgba(255,61,90,.07)",br:"rgba(255,61,90,.22)"},
    MEDIUM:  {c:"var(--amber)", bg:"rgba(245,166,35,.07)",br:"rgba(245,166,35,.22)"},
    LOW:     {c:"var(--green)", bg:"rgba(0,229,153,.07)",br:"rgba(0,229,153,.22)"},
  }[s]||{c:"var(--muted)",bg:"transparent",br:"var(--border)"});

  const dismiss = id => setAlerts(a=>a.filter(x=>x.id!==id));
  const dismissAll = () => setAlerts([]);
  const markRead = id => setAlerts(a=>a.map(x=>x.id===id?{...x,read:true}:x));

  const filtered = filter==="ALL" ? alerts : alerts.filter(a=>a.sev===filter);
  const unread = alerts.filter(a=>!a.read).length;

  return (
    <div style={{padding:22,display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"var(--font-data)",fontSize:8,color:"var(--dim)",letterSpacing:".15em",marginBottom:3}}>
            ALERT MANAGEMENT
          </div>
          <h1 style={{fontWeight:800,fontSize:20}}>
            Active Alerts 
            <span style={{fontFamily:"var(--font-data)",fontSize:14,color:"var(--muted)",fontWeight:400}}>
              ({alerts.length})
            </span>
          </h1>
        </div>

        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {unread>0 && (
            <span style={{
              fontFamily:"var(--font-data)",
              fontSize:10,
              color:"var(--amber)",
              background:"rgba(245,166,35,.1)",
              border:"1px solid rgba(245,166,35,.25)",
              borderRadius:6,
              padding:"4px 10px"
            }}>
              {unread} UNREAD
            </span>
          )}

          <button onClick={dismissAll} style={{
            background:"transparent",
            border:"1px solid var(--border)",
            color:"var(--muted)",
            borderRadius:8,
            padding:"6px 13px",
            fontSize:12,
            cursor:"pointer"
          }}>
            Clear All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8}}>
        {sevs.map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{
            padding:"6px 12px",
            borderRadius:8,
            border:"1px solid var(--border)",
            background: filter===s ? "var(--blue)" : "transparent",
            color: filter===s ? "#fff" : "var(--muted)",
            cursor:"pointer",
            fontSize:11
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(a=>{
          const st = sevStyle(a.sev);
          return (
            <div key={a.id} className="card" style={{
              padding:14,
              background:st.bg,
              border:`1px solid ${st.br}`
            }}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>{a.title}</div>
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>
                    {a.desc}
                  </div>
                </div>

                <div style={{display:"flex",gap:6}}>
                  {!a.read && (
                    <button onClick={()=>markRead(a.id)}>✔</button>
                  )}
                  <button onClick={()=>dismiss(a.id)}>✖</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};