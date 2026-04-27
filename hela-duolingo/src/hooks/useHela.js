import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CRYPTODUO_ADDRESS = "0x0000000000000000000000000000000000000000"; // Update after deployment
const HELA_CHAIN_ID = "0xa2d18"; // 666888 in hex

export const useHela = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask not found");
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);

      // Try to switch to Hela Chain
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: HELA_CHAIN_ID }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: HELA_CHAIN_ID,
                chainName: 'Hela Testnet',
                nativeCurrency: { name: 'Hela', symbol: 'HLSC', decimals: 18 },
                rpcUrls: ['https://testnet-rpc.helachain.com'],
                blockExplorerUrls: ['https://testnet-blockexplorer.helachain.com'],
              },
            ],
          });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const completeLessonOnChain = async (lessonId) => {
    if (!account || !provider) return;

    try {
      setLoading(true);
      const signer = await provider.getSigner();
      // This is a placeholder for actual contract interaction
      // const contract = new ethers.Contract(CRYPTODUO_ADDRESS, ABI, signer);
      // const tx = await contract.completeLesson(lessonId);
      // await tx.wait();
      
      console.log(`Lesson ${lessonId} completed on Hela chain!`);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { account, connectWallet, completeLessonOnChain, loading, error };
};
