import { ethers } from "ethers";

let provider;
let signer;

let factoryContract;
let streamContract;

const FACTORY_ADDRESS = "0xfDbe1DdaBed74DDc78382f8e834e2Ef192b723e4";

/*//////////////////////////////////////////////////////////////
                    MINIMAL ABIs - ONLY ESSENTIAL FUNCTIONS
//////////////////////////////////////////////////////////////*/

// Minimal factory ABI - only what we absolutely need
const FACTORY_ABI = [
  "function createStream(address employee, address taxVault, uint256 monthlySalary, uint256 taxPercent) payable returns(address)",

  "function getEmployerStreams(address employer) view returns(address[])",

  "function getEmployeeStreams(address employee) view returns(address[])",

  "function getAllStreams() view returns(address[])"
];


// Minimal stream ABI
const STREAM_ABI = [ 
  "function withdrawableAmount() view returns(uint256)",
  "function employer() view returns(address)",
  "function withdraw()",
  "function pause()",
  "function resume()",
  "function cancel()",
  "function monthlySalary() view returns(uint256)",
  "function employee() view returns(address)",
  "function status() view returns(uint8)"
];

/*//////////////////////////////////////////////////////////////
                    CONNECT WALLET
//////////////////////////////////////////////////////////////*/

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not installed");

  // request account
  await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  // force network
  const REQUIRED_CHAIN = "0xA2D08"; // example hex chain id

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: REQUIRED_CHAIN }]
    });
  } catch (err) {
    console.log("Network not added yet");
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  factoryContract = new ethers.Contract(
    FACTORY_ADDRESS,
    FACTORY_ABI,
    signer
  );

  return signer.address;
}


/*//////////////////////////////////////////////////////////////
                    FACTORY ACCESS
//////////////////////////////////////////////////////////////*/

export function getFactory() {
  if (!factoryContract) {
    throw new Error("Wallet not connected");
  }
  return factoryContract;
}

/*//////////////////////////////////////////////////////////////
            LOAD SPECIFIC STREAM CONTRACT
//////////////////////////////////////////////////////////////*/

export function loadStream(address) {
  if (!signer) {
    throw new Error("Wallet not connected");
  }
  
  streamContract = new ethers.Contract(
    address,
    STREAM_ABI,
    signer
  );
  return streamContract;
}

export function getStream() {
  if (!streamContract) {
    throw new Error("Stream not loaded");
  }
  return streamContract;
}
export function getUserAddress() {
  return signer.getAddress();
}
