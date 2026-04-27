import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Clock, Plus, Zap, CheckCircle, XCircle } from 'lucide-react'

// Declare ethereum in global window to prevent TS errors
declare global {
  interface Window {
    ethereum?: any;
    phantom?: any;
  }
}

const getProvider = () => {
  if (typeof window === 'undefined') return null;
  
  // If multiple providers exist, try to find a preferred one or return the main one
  if (window.ethereum?.providers) {
    return window.ethereum.providers.find((p: any) => p.isMetaMask) || window.ethereum.providers[0];
  }
  
  // Prefer window.ethereum as it's the EIP-1193 standard 
  // Phantom also injects itself here if set as default
  return window.ethereum || window.phantom?.ethereum;
};

// Replace with deployed contract address if you deploy it
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" // Placeholder
const HELA_CHAIN_ID = 666888

function App() {
  const [account, setAccount] = useState<string>('')
  const [targetAddress, setTargetAddress] = useState('')
  const [callData, setCallData] = useState('0x')
  const [executionTime, setExecutionTime] = useState('')
  const [interval, setIntervalVal] = useState('0')
  const [tasks, setTasks] = useState<any[]>([])

  function loadTasks() {
    // Mock load
    setTasks([
      { id: 1, target: '0x1A2B...3C4D', time: Date.now() + 86400000, isActive: true },
      { id: 2, target: '0x5E6F...7G8H', time: Date.now() - 100000, isActive: false }
    ])
  }

  useEffect(() => {
    // Small delay to allow extensions to fully inject/initialize
    const timer = setTimeout(() => {
      const provider = getProvider()
      
      const checkConnection = async () => {
        if (provider) {
          try {
            const accounts = await provider.request({ method: 'eth_accounts' })
            if (accounts.length > 0) {
              setAccount(accounts[0])
              loadTasks()
            }
          } catch (err) {
            // Quietly fail for auto-connect
            console.warn("Auto-connect check skipped:", err)
          }
        }
      }
      checkConnection()
    }, 500);

    return () => clearTimeout(timer);
  }, [])

  // Seperate effect for listeners to keep them stable
  useEffect(() => {
    const provider = getProvider()
    if (provider) {
      const handleAccounts = (accounts: string[]) => {
        setAccount(accounts.length > 0 ? accounts[0] : '')
      }
      const handleChain = () => window.location.reload()

      provider.on('accountsChanged', handleAccounts)
      provider.on('chainChanged', handleChain)

      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccounts)
          provider.removeListener('chainChanged', handleChain)
        }
      }
    }
  }, [])



  const HELA_TESTNET = {
    chainId: "0xa2d08", // 666888 hex
    chainName: "Hela Official Runtime Testnet",
    nativeCurrency: { name: "HLUSD", symbol: "HLUSD", decimals: 18 },
    rpcUrls: ["https://testnet-rpc.helachain.com"],
    blockExplorerUrls: ["https://testnet-blockscout.helachain.com"],
  };

  const connectWallet = async () => {
    const provider = getProvider()
    if (!provider) {
      alert("No Web3 wallet found. Please install Phantom or MetaMask!")
      return window.open("https://phantom.app/", "_blank")
    }

    try {
      // 1. Switch Network First
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: HELA_TESTNET.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902 || switchError?.message?.includes("Unrecognized chain") || switchError?.message?.includes("Try adding the chain")) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [HELA_TESTNET],
          });
        } else {
          throw switchError;
        }
      }
      
      // 2. Request Accounts using ethers.BrowserProvider
      const _provider = new ethers.BrowserProvider(provider)
      await _provider.send("eth_requestAccounts", [])
      const signer = await _provider.getSigner()
      const addr = await signer.getAddress()
      
      setAccount(addr)
      loadTasks()
      
    } catch (err: any) {
      console.error("Wallet connection caught an error:", err)
      alert("Wallet connection failed. " + (err?.message || "Unexpected error"))
    }
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!account) return alert("Please connect your wallet first via the top right button.")
    
    // In a real app we'd interact with `CronScheduler.scheduleTask(...)` via `ethers` contract here
    // e.g., const tx = await contract.scheduleTask(targetAddress, callData, new Date(executionTime).getTime(), interval)
    
    const newTask = {
      id: tasks.length + 1,
      target: targetAddress || '0xNew...Task',
      time: new Date(executionTime).getTime(),
      isActive: true
    }
    
    setTasks([...tasks, newTask])
    setTargetAddress('')
    setCallData('0x')
    setExecutionTime('')
    setIntervalVal('0')
    
    alert("Task Creation Tx Mock Sent! Check pending state.")
  }

  return (
    <>
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="flex items-center gap-2"><Clock /> Onchain Cron</h1>
          <p className="text-secondary text-sm">Hela Network Scheduler</p>
        </div>
        
        {account ? (
          <div className="timestamp-badge flex items-center gap-2">
            <div style={{width: 8, height: 8, background: 'green', borderRadius: '50%'}}></div>
            {account.slice(0,6)}...{account.slice(-4)}
          </div>
        ) : (
          <button onClick={connectWallet} className="flex items-center gap-2">
            Connect Wallet
          </button>
        )}
      </header>

      <main>
        <section className="paper-card">
          <h2 className="flex items-center gap-2 mb-4"><Plus size={20} /> Schedule New Task</h2>
          <form onSubmit={handleCreateTask}>
            <div>
              <label className="text-sm font-bold">Target Contract Address</label>
              <input 
                type="text" 
                placeholder="0x..." 
                value={targetAddress}
                onChange={e => setTargetAddress(e.target.value)}
                required 
              />
            </div>
            
            <div>
              <label className="text-sm font-bold">Call Data (Hex)</label>
              <input 
                type="text" 
                placeholder="0x..." 
                value={callData}
                onChange={e => setCallData(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-4">
              <div style={{flex: 1}}>
                <label className="text-sm font-bold">Execution Time</label>
                <input 
                   type="datetime-local" 
                  value={executionTime}
                  onChange={e => setExecutionTime(e.target.value)}
                  required 
                />
              </div>
              <div style={{flex: 1}}>
                <label className="text-sm font-bold">Interval (Seconds)</label>
                <input 
                  type="number" 
                  min="0"
                  value={interval}
                  onChange={e => setIntervalVal(e.target.value)}
                  placeholder="0 for one-time task"
                />
              </div>
            </div>

            <button type="submit" className="mt-2 w-full flex items-center justify-center gap-2">
              <Zap size={18} /> Deploy Task to Hela
            </button>
          </form>
        </section>

        <section className="mt-4">
          <h2>Your Scheduled Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-secondary italic">No tasks scheduled yet. Connect wallet to load or create one.</p>
          ) : (
            <div className="flex flex-col gap-2" style={{ flexDirection: 'column' }}>
              {tasks.map(task => (
                <div key={task.id} className="paper-card" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
                  <div className="flex justify-between items-center task-item-header">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Task #{task.id}</span>
                        {task.isActive ? (
                          <span style={{ color: 'green' }}><CheckCircle size={16} /> Pending</span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}><XCircle size={16} /> Executed/Inactive</span>
                        )}
                      </div>
                      <div className="text-sm text-secondary mt-1">Target: {task.target}</div>
                    </div>
                    <div className="timestamp-badge">
                      Run at: {new Date(task.time).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default App
