import { useState, useEffect, useCallback } from 'react';
import {
  connectWallet, getBalance, getChainId, getNetworkInfo,
  getTransactionHistory, isMetaMaskInstalled, truncateAddress
} from '../utils/wallet';

export const useWallet = () => {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(null);
  const [network, setNetwork] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  const refreshBalance = useCallback(async (addr) => {
    if (!addr) return;
    try {
      const bal = await getBalance(addr);
      setBalance(bal);
    } catch (e) {
      console.error('Balance fetch error:', e);
    }
  }, []);

  const refreshTxHistory = useCallback(async (addr) => {
    if (!addr) return;
    try {
      const txs = await getTransactionHistory(addr);
      setTransactions(txs);
    } catch (e) {
      console.error('TX history error:', e);
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const account = await connectWallet();
      const cId = await getChainId();
      const net = getNetworkInfo(cId);
      setAddress(account);
      setChainId(cId);
      setNetwork(net);
      setConnected(true);
      await refreshBalance(account);
      await refreshTxHistory(account);
    } catch (e) {
      setError(e.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  }, [refreshBalance, refreshTxHistory]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance('0');
    setChainId(null);
    setNetwork(null);
    setTransactions([]);
    setConnected(false);
    setError(null);
  }, []);

  // Listen for account/network changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        await refreshBalance(accounts[0]);
        await refreshTxHistory(accounts[0]);
      }
    };

    const handleChainChanged = async (chainIdHex) => {
      const cId = parseInt(chainIdHex, 16);
      setChainId(cId);
      setNetwork(getNetworkInfo(cId));
      if (address) await refreshBalance(address);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [address, disconnect, refreshBalance, refreshTxHistory]);

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const cId = await getChainId();
          const net = getNetworkInfo(cId);
          setAddress(accounts[0]);
          setChainId(cId);
          setNetwork(net);
          setConnected(true);
          await refreshBalance(accounts[0]);
          await refreshTxHistory(accounts[0]);
        }
      } catch (e) {
        console.error('Check connection error:', e);
      }
    };
    checkConnection();
  }, []);

  return {
    address,
    shortAddress: truncateAddress(address),
    balance,
    chainId,
    network,
    transactions,
    connecting,
    connected,
    error,
    connect,
    disconnect,
    refreshBalance: () => refreshBalance(address),
  };
};
