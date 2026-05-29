import  { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './index.css';

// Mock AI Difficulty Logic
const questionBank = {
  easy: [
    { q: "What does 'DeFi' stand for?", options: ["Decentralized Finance", "Digital Fiat", "Direct Funding", "Data Fetching"], answer: 0 },
    { q: "What is an NFT?", options: ["Non-Fungible Token", "New File Type", "Network Fee Transfer", "Node Function Test"], answer: 0 }
  ],
  medium: [
    { q: "Which of these is a decentralized exchange (DEX)?", options: ["Binance", "Coinbase", "Uniswap", "Kraken"], answer: 2 },
    { q: "What is a 'seed phrase' used for?", options: ["Buying NFTs", "Recovering a wallet", "Speeding up txs", "Staking tokens"], answer: 1 }
  ],
  hard: [
    { q: "What is Impermanent Loss?", options: ["Losing your seed phrase", "Loss when providing liquidity", "When a token crashes 100%", "Gas fees being too high"], answer: 1 },
    { q: "What standard is commonly used for NFTs on Ethereum?", options: ["ERC-20", "ERC-721", "ERC-1155", "Both ERC-721 & 1155"], answer: 3 }
  ]
};

function App() {
  const [wallet, setWallet] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [level, setLevel] = useState(1);
  const [tokens, setTokens] = useState(0);
  
  // Lesson state
  const [currentDifficulty, setCurrentDifficulty] = useState('easy');
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const questions = questionBank['easy'];
    return questions[Math.floor(Math.random() * questions.length)];
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [taskMode, setTaskMode] = useState(false);
  const [taskType, setTaskType] = useState(''); // 'swap' or 'mint'
  
  useEffect(() => {
    if (darkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }, [darkMode]);

  const loadNextQuestion = (difficulty) => {
    const questions = questionBank[difficulty];
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(questions[randomIndex]);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWallet(address);
      } catch (err) {
        console.error("Connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const handleOptionClick = (index) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setIsCorrect(index === currentQuestion.answer);
  };

  const handleContinue = () => {
    if (isCorrect) {
      const newProgress = progress + 25;
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        setTaskMode(true);
        setTaskType(Math.random() > 0.5 ? 'swap' : 'mint');
      } else {
        const newDiff = currentDifficulty === 'easy' ? 'medium' 
                      : currentDifficulty === 'medium' ? 'hard' 
                      : 'hard';
        setCurrentDifficulty(newDiff);
        loadNextQuestion(newDiff);
      }
    } else {
      const newDiff = currentDifficulty === 'hard' ? 'medium' 
                    : currentDifficulty === 'medium' ? 'easy' 
                    : 'easy';
      setCurrentDifficulty(newDiff);
      loadNextQuestion(newDiff);
    }
  };

  const completeTask = () => {
    if (!wallet) return alert("Connect wallet to claim on-chain rewards!");
    
    setTimeout(() => {
      setLevel(level + 1);
      setTokens(tokens + 10);
      setProgress(0);
      setTaskMode(false);
      setCurrentDifficulty('easy');
      loadNextQuestion('easy');
      alert(`Task Completed! You earned 10 HLT Tokens! ${level >= 2 ? 'And a Proof of Completion SBT!' : ''}`);
    }, 1500);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">
          <span style={{ fontSize: '2.5rem' }}>🦉</span> Polyglot Web3
        </div>
        <div className="stats">
          <div className="stat-badge">🔥 {level} Day Streak</div>
          <div className="stat-badge">💰 {tokens} HLT</div>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {!wallet && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button className="btn btn-secondary" onClick={connectWallet}>
            Connect Wallet to Start Learning
          </button>
        </div>
      )}

      {wallet && (
        <>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          {!taskMode ? (
            <div className="lesson-container">
              {currentQuestion && (
                <>
                  <div className="question-text">{currentQuestion.q}</div>
                  <div className="options-grid">
                    {currentQuestion.options.map((opt, idx) => {
                      let className = "option-card ";
                      if (selectedOption === idx) {
                        className += isCorrect ? "correct" : "incorrect";
                      } else if (selectedOption !== null && idx === currentQuestion.answer) {
                        className += "correct"; // reveal answer
                      }
                      return (
                        <div key={idx} className={className} onClick={() => handleOptionClick(idx)}>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="lesson-container">
              <div className="question-text">
                Great job! Now let's put it into practice.
              </div>
              <div style={{ padding: '2rem', background: 'var(--bg-color)', borderRadius: '16px', border: '2px dashed var(--primary)' }}>
                <h3>{taskType === 'swap' ? '🔄 Swap Tokens (Testnet)' : '🖼️ Mint NFT (Testnet)'}</h3>
                <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
                  Complete this on-chain action to verify your knowledge and earn rewards.
                </p>
                <button className="btn btn-primary" onClick={completeTask}>
                  {taskType === 'swap' ? 'Execute Swap' : 'Mint Proof'}
                </button>
              </div>
            </div>
          )}

          <div className="action-bar">
            <div className="wallet-address">
              {wallet.substring(0, 6)}...{wallet.substring(38)}
            </div>
            {selectedOption !== null && !taskMode && (
              <button className="btn btn-primary" onClick={handleContinue} disabled={progress >= 100}>
                CONTINUE
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
