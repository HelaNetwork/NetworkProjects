declare global { interface Window { ethereum: any; } }
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../lib/contract';
import { supabase } from '../lib/supabase'; 

export const useWeb3 = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({ 
    tvl: '0', 
    gasTank: '0', 
    taxVault: '0', 
    activeStreams: '0' 
  });
  const [transactions, setTransactions] = useState<any[]>([]);

  // --- 1. Supabase History & Real-Time Sync ---
  useEffect(() => {
    if (!account) return; 

    const loadHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('protocol_ledger')
          .select('*')
          .ilike('user_address', account) 
          .order('block', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        if (data) setTransactions(data);
      } catch (err) {
        console.error("Supabase load error:", err);
      }
    };
    
    loadHistory();

    const channel = supabase.channel('ledger-updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'protocol_ledger' }, 
        (payload) => {
          const newUserAddr = payload.new?.user_address;
          if (newUserAddr && account && newUserAddr.toLowerCase() === account.toLowerCase()) {
            setTransactions(prev => [payload.new, ...prev].slice(0, 10));
          }
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [account]);

  // --- 2. Contract Data Hydration ---
 const fetchContractStats = useCallback(async (userProvider: ethers.Provider) => {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, userProvider);
      
      // 💡 Get the actual ID of the stream we just created
      const nextId = await contract.nextStreamId().catch(() => BigInt(0));
      const currentStreamId = nextId > BigInt(0) ? nextId - BigInt(1) : BigInt(0);

      const [gas, ownerAddr, paused, tvl, tax] = await Promise.all([
        account ? contract.gasSponsorshipTank(account).catch(() => BigInt(0)) : BigInt(0),
        contract.owner().catch(() => ""),
        contract.isPaused().catch(() => false),
        // 💡 Fix: Query the ACTUAL stream balance (currentStreamId), not ID 0
        currentStreamId > BigInt(0) ? contract.earnedBalance(currentStreamId).catch(() => BigInt(0)) : BigInt(0), 
        contract.taxVault ? contract.taxVault(account || ethers.ZeroAddress).catch(() => BigInt(0)) : BigInt(0)
      ]);

      setStats({ 
        tvl: ethers.formatEther(tvl), 
        gasTank: ethers.formatEther(gas), 
        taxVault: ethers.formatEther(tax), 
        // 💡 Fix: Show "1" if there is 1 stream active
        activeStreams: currentStreamId.toString() 
      });
      setIsPaused(paused);
      if (account) setIsOwner(account.toLowerCase() === ownerAddr.toLowerCase());
    } catch (err) { 
      console.warn("Stats hydration error:", err); 
    }
  }, [account]);

  // --- 3. Core Protocol Actions ---
const createNewStream = async (recipient: string, amount: string) => {
    if (!signer || !account) return;
    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const dripRate = BigInt(1000000); 
      const totalValue = ethers.parseUnits(amount, "ether");

      // 💡 CHANGE: Adding a manual nonce fetch to bypass MetaMask's stuck cache
      const currentNonce = await signer.provider?.getTransactionCount(account);

      const tx = await contract.createBatchStreams(
        [recipient], 
        [dripRate], 
        [10], 
        [totalValue],
        { 
          value: 0,
          nonce: currentNonce, // 💡 FORCE a new transaction number
          gasLimit: 250000 
        }
      );
      
      const receipt = await tx.wait();
      console.log("SUCCESS!", receipt.hash);
      await fetchContractStats(signer.provider as ethers.Provider);
    } catch (err: any) { 
        console.error("FINAL ATTEMPT ERROR:", err.reason || err.message || err); 
    } finally { setLoading(false); }
  };
  const claimEarnings = async (streamId: number) => {
    if (!signer || !account) return;
    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // Increased gasLimit for claim to ensure gas sponsorship works
      const tx = await contract.claimFunds(streamId, { gasLimit: 500000 }); 
      const receipt = await tx.wait(); 

      await supabase.from('protocol_ledger').insert([{
        type: "Salary Withdrawal",
        hash: receipt.hash,
        block: parseInt(receipt.blockNumber.toString()),
        user_address: account
      }]);

      await fetchContractStats(signer.provider as ethers.Provider);
    } catch (err) { console.error("Claim failed:", err); } finally { setLoading(false); }
  };

  const refillGasTank = async (amount: string) => {
    if (!signer || !account) return;
    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.fundGasTank({ value: ethers.parseUnits(amount, "ether") });
      const receipt = await tx.wait(); 
      await supabase.from('protocol_ledger').insert([{ 
        type: "Gas Tank Refill", 
        hash: receipt.hash, 
        block: parseInt(receipt.blockNumber.toString()), 
        user_address: account 
      }]);
      await fetchContractStats(signer.provider as ethers.Provider);
    } catch (err) { console.error("Refill failed:", err); } finally { setLoading(false); }
  };

  const pushBonus = async (streamId: number, amount: string) => {
    if (!signer || !account) return;
    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.pushBonus(streamId, ethers.parseUnits(amount, "ether"));
      const receipt = await tx.wait(); 
      await supabase.from('protocol_ledger').insert([{ 
        type: "Performance Bonus", 
        hash: receipt.hash, 
        block: parseInt(receipt.blockNumber.toString()), 
        user_address: account 
      }]);
      await fetchContractStats(signer.provider as ethers.Provider);
    } catch (err) { console.error("Bonus failed:", err); } finally { setLoading(false); }
  };

  const togglePause = async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.togglePause();
      const receipt = await tx.wait(); 
      await supabase.from('protocol_ledger').insert([{ 
        type: isPaused ? "Protocol Resumed" : "Emergency Pause", 
        hash: receipt.hash, 
        block: parseInt(receipt.blockNumber.toString()), 
        user_address: account 
      }]);
      await fetchContractStats(signer.provider as ethers.Provider);
    } catch (err) { console.error("Pause failed:", err); } finally { setLoading(false); }
  };

  // --- 4. Wallet Connectivity ---
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const userSigner = await provider.getSigner();
        setAccount(accounts[0]); 
        setSigner(userSigner);
        await fetchContractStats(provider);
      } catch (err) { console.error("Connect failed:", err); } finally { setLoading(false); }
    }
  };

  const disconnectWallet = () => {
    setAccount(null); 
    setSigner(null); 
    setIsOwner(false);
    setStats({ tvl: '0', gasTank: '0', taxVault: '0', activeStreams: '0' });
    setTransactions([]);
  };

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          const userSigner = await provider.getSigner();
          setAccount(accounts[0]); 
          setSigner(userSigner);
          await fetchContractStats(provider);
        }
      }
    };
    init();
  }, [fetchContractStats]);

  return {
    account, isOwner, signer, loading, stats, transactions, isPaused,
    connectWallet, disconnectWallet, createNewStream, claimEarnings, refillGasTank, pushBonus, togglePause
  };
};