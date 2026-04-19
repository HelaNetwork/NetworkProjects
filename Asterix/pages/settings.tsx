// SettingsPage (from your code)
const SettingsPage = () => {
  const [saved,setSaved]=useState(false);

  const [cfg,setCfg]=useState({
    emailAlerts:true, smsAlerts:false, pushAlerts:true,
    criticalOnly:false, autoRefresh:true, refreshRate:"30",
    riskThreshold:"65", timezone:"UTC", darkMode:true,
    dataDensity:"standard", apiKey:"cg-api-●●●●●●●●●●●●●●●●",
    name:"Jane Analyst", email:"analyst@globalrisk.com",
    role:"Senior Risk Analyst", twoFA:true, sessionTimeout:"60",
    slackWebhook:false, teamsWebhook:false,
  });

  const set = k => v => setCfg(c=>({...c,[k]:v}));
  const tog = k => () => setCfg(c=>({...c,[k]:!c[k]}));
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2200); };

  const Tog = ({k}) => (
    <div className={`tog${cfg[k]?" on":""}`} onClick={tog(k)}/>
  );

  const Row = ({lbl,sub,children}) => (
    <div style={{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center",
      padding:"13px 0",
      borderBottom:"1px solid rgba(255,255,255,.03)"
    }}>
      <div>
        <div style={{fontSize:13,fontWeight:500}}>{lbl}</div>
        {sub && <div style={{fontSize:11,color:"var(--muted)"}}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{padding:22,display:"flex",flexDirection:"column",gap:18}}>
      <h1 style={{fontWeight:800,fontSize:20}}>Settings</h1>

      <div className="card" style={{padding:20}}>
        <Row lbl="Email Alerts"><Tog k="emailAlerts"/></Row>
        <Row lbl="SMS Alerts"><Tog k="smsAlerts"/></Row>
        <Row lbl="Push Notifications"><Tog k="pushAlerts"/></Row>
        <Row lbl="Auto Refresh"><Tog k="autoRefresh"/></Row>
        <Row lbl="Dark Mode"><Tog k="darkMode"/></Row>
      </div>

      <button onClick={save} className="btn-p">
        Save Settings
      </button>

      {saved && <div style={{color:"var(--green)"}}>Saved ✔</div>}
    </div>
  );
};