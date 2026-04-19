export default function Employee(){

return(

<div>

<h1>👨‍💻 Employee Panel</h1>

<div style={{
  background:"white",
  padding:30,
  borderRadius:16,
  maxWidth:500,
  boxShadow:"0 10px 25px rgba(0,0,0,0.08)"
}}>


<input placeholder="Stream ID"/>

<button style={{
marginTop:20,
background:"#22c55e",
padding:12,
border:"none",
color:"white",
borderRadius:8
}}>
Withdraw Salary
</button>

<h2 style={{marginTop:30,color:"#22c55e"}}>
Earned: 0.000 ETH
</h2>

</div>

</div>

)

}
