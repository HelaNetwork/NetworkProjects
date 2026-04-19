import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  TREASURY_ADDRESS,
  STREAM_ADDRESS,
  OFFRAMP_ADDRESS,
  TREASURY_ABI,
  STREAM_ABI,
  OFFRAMP_ABI,
} from '../contracts';

const HELA_CHAIN_ID = 666888;
const HELA_CHAIN_ID_HEX = '0x' + HELA_CHAIN_ID.toString(16);

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contracts, setContracts] = useState({ treasury: null, salaryStream: null, offRamp: null });
  const [chainId, setChainId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const buildContracts = useCallback((signer) => {
    const contracts = {
      treasury: new ethers.Contract(TREASURY_ADDRESS, TREASURY_ABI, signer),
      salaryStream: new ethers.Contract(STREAM_ADDRESS, STREAM_ABI, signer),
    };
    
    // Only add OffRamp if address is set (not zero address)
    if (OFFRAMP_ADDRESS && OFFRAMP_ADDRESS !== "0x0000000000000000000000000000000000000000") {
      contracts.offRamp = new ethers.Contract(OFFRAMP_ADDRESS, OFFRAMP_ABI, signer);
    }
    
    return contracts;
  }, []);

  const handleChainChanged = useCallback((chainIdHex) => {
    const id = parseInt(chainIdHex, 16);
    setChainId(id);
    setIsCorrectNetwork(id === HELA_CHAIN_ID);
    // Reload to reset state cleanly
    window.location.reload();
  }, []);

  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      console.log('🔌 Wallet disconnected');
      setAccount(null);
      setSigner(null);
      setContracts({ treasury: null, salaryStream: null, offRamp: null });
    } else {
      // Account changed - rebuild signer and contracts with new account
      console.log('🔄 Account changed to:', accounts[0]);
      try {
        const p = new ethers.BrowserProvider(window.ethereum);
        const s = await p.getSigner();
        const network = await p.getNetwork();
        const id = Number(network.chainId);
        
        setSigner(s);
        setAccount(accounts[0]);
        
        // Rebuild contracts with new signer
        if (id === HELA_CHAIN_ID) {
          const newContracts = buildContracts(s);
          setContracts(newContracts);
          console.log('✅ Contracts rebuilt for new account');
        }
      } catch (err) {
        console.error('❌ Failed to update signer on account change:', err);
        // Fallback: just update account state
        setAccount(accounts[0]);
      }
    }
  }, [buildContracts]);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [handleChainChanged, handleAccountsChanged]);

  // Auto-connect if already connected
  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const p = new ethers.BrowserProvider(window.ethereum);
          const s = await p.getSigner();
          const network = await p.getNetwork();
          const id = Number(network.chainId);
          setProvider(p);
          setSigner(s);
          setAccount(accounts[0]);
          setChainId(id);
          setIsCorrectNetwork(id === HELA_CHAIN_ID);
          if (id === HELA_CHAIN_ID) {
            setContracts(buildContracts(s));
          }
        }
      } catch (e) {
        console.error('Auto-connect failed:', e);
      }
    })();
  }, [buildContracts]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use PayStream.');
      return;
    }
    setConnecting(true);
    try {
      const p = new ethers.BrowserProvider(window.ethereum);
      await p.send('eth_requestAccounts', []);
      const s = await p.getSigner();
      const network = await p.getNetwork();
      const id = Number(network.chainId);
      const addr = await s.getAddress();

      setProvider(p);
      setSigner(s);
      setAccount(addr);
      setChainId(id);
      setIsCorrectNetwork(id === HELA_CHAIN_ID);

      if (id === HELA_CHAIN_ID) {
        setContracts(buildContracts(s));
      }
    } catch (err) {
      console.error('Connect failed:', err);
    } finally {
      setConnecting(false);
    }
  }, [buildContracts]);

  const switchToHela = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HELA_CHAIN_ID_HEX }],
      });
    } catch (switchError) {
      // Chain not added, try adding it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: HELA_CHAIN_ID_HEX,
                chainName: 'HeLa Testnet',
                nativeCurrency: { name: 'HLUSD', symbol: 'HLUSD', decimals: 18 },
                rpcUrls: ['https://testnet-rpc.helachain.com'],
                blockExplorerUrls: ['https://testnet-blockexplorer.helachain.com'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add HeLa:', addError);
        }
      }
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        signer,
        provider,
        contracts,
        chainId,
        isCorrectNetwork,
        connecting,
        connectWallet,
        switchToHela,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
