import { startStream } from "../contract";
import { useState } from "react";

export default function HR(){

const [wallet,setWallet]=useState("");
const [salary,setSalary]=useState("");

async function start(){
 await startStream(wallet,salary,10);
}

return(

<div style={{
background:"#f3f4f6",
minHeight:"100vh",
padding:40
}}>

<div style={{
background:"white",
padding:30,
borderRadius:16,
maxWidth:500,
boxShadow:"0 10px 30px rgba(0,0,0,0.08)"
}}>

<h2 style={{marginBottom:20}}>🏢 HR Dashboard</h2>

<input
placeholder="Employee wallet"
onChange={e=>setWallet(e.target.value)}
style={{
width:"100%",
padding:12,
marginBottom:12,
border:"1px solid #ddd",
borderRadius:8
}}
/>

<input
placeholder="Monthly salary (wei)"
onChange={e=>setSalary(e.target.value)}
style={{
width:"100%",
padding:12,
marginBottom:20,
border:"1px solid #ddd",
borderRadius:8
}}
/>

<button
onClick={start}
style={{
width:"100%",
padding:14,
background:"#6366f1",
color:"white",
border:"none",
borderRadius:10,
fontWeight:"bold",
cursor:"pointer"
}}
>
Start Stream
</button>

</div>

</div>

);

}
