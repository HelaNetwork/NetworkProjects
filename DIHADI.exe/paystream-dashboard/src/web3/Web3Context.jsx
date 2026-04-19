import { createContext, useState } from "react";
import { ethers } from "ethers";
// import { CONTRACT_ADDRESS, HLUSD_ADDRESS, CHAIN_ID, CHAIN_HEX } from "./config";
import { CONTRACT_ADDRESS, CHAIN_ID, CHAIN_HEX } from "./config";
import { PAYSTREAM_ABI, ERC20_ABI } from "./abi";

export const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  // const [hlusd, setHlusd] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (Number(network.chainId) !== CHAIN_ID) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_HEX }],
        });
      }

      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        PAYSTREAM_ABI,
        signer
      );

      // const hlusdInstance = new ethers.Contract(
      //   HLUSD_ADDRESS,
      //   ERC20_ABI,
      //   signer
      // );
      window.debugContract = contractInstance;
      // window.debugHlusd = hlusdInstance;
      window.debugAccount = accounts[0];

      const ownerAddress = await contractInstance.owner();

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setContract(contractInstance);
      // setHlusd(hlusdInstance);
      setIsOwner(accounts[0].toLowerCase() === ownerAddress.toLowerCase());

    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        contract,
        // hlusd,
        isOwner,
        connectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}