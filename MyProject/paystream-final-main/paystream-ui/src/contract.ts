import { ethers } from "ethers";

const CONTRACT="0x9B86F7D81A12807fEBbAb4C9ddA1cBD989fA8da6";

const abi = [
  "function startStream(address employee,uint256 monthlySalary,uint256 taxPercent)",
  "function withdraw()",
  "function accrued() view returns(uint256)"
];


async function connect(){

const provider=new ethers.BrowserProvider(
(window as any).ethereum,
{ name:"hela",chainId:666888 }
);

const signer=await provider.getSigner();

return new ethers.Contract(CONTRACT,abi,signer);
}

export async function startStream(emp:string,salary:string,tax:number){

const c=await connect();

const wei=ethers.parseEther(salary);

const tx=await c.startStream(emp,wei,tax);

await tx.wait();
}

export async function earned(){

const c=await connect();

const v=await c.accrued();

return ethers.formatEther(v);
}

export async function withdraw(){

const c=await connect();

const tx=await c.withdraw();

await tx.wait();
}
