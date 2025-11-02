import React, { useState, useEffect } from 'react';
import './App.css';

// Freighter API types
interface FreighterApi {
  isConnected: () => Promise<boolean>;
  getPublicKey: () => Promise<string>;
  getNetwork: () => Promise<string>;
  signTransaction: (xdr: string, opts?: Record<string, unknown>) => Promise<string>;
}

declare global {
  interface Window {
    freighterApi?: FreighterApi;
  }
}

interface TreasureHunt {
  id: number;
  name: string;
  description: string;
  reward: number;
  riddle: string;
}

interface PlayerProgress {
  completedHunts: number[];
  totalRewards: number;
}

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || 'YOUR_CONTRACT_ID_HERE';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

const TREASURE_HUNTS: TreasureHunt[] = [
  {
    id: 1,
    name: "Stellar Origins",
    description: "Discover the foundation of fast, low-cost payments",
    reward: 100,
    riddle: "What is the name of the blockchain network we're building on? (hint: it's in the stars)"
  },
  {
    id: 2,
    name: "Soroban Power",
    description: "Unlock the smart contract platform",
    reward: 200,
    riddle: "What is Stellar's smart contract platform called? (hint: it's a scientific instrument)"
  }
];

function App() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState<PlayerProgress>({ completedHunts: [], totalRewards: 0 });
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [messages, setMessages] = useState<{ [key: number]: string }>({});

  // Check if Freighter is installed
  useEffect(() => {
    checkFreighterInstalled();
  }, []);

  const checkFreighterInstalled = () => {
    if (!window.freighterApi) {
      alert('Freighter wallet not detected! Please install Freighter extension.');
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.freighterApi) {
        alert('Please install Freighter wallet extension');
        return;
      }

      const network = await window.freighterApi.getNetwork();
      if (network !== 'TESTNET') {
        alert('Please switch to Stellar Testnet in Freighter');
        return;
      }

      const publicKey = await window.freighterApi.getPublicKey();
      setWalletAddress(publicKey);
      setIsConnected(true);
      
      // Load player progress
      await loadProgress(publicKey);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  };

  // Load player progress from contract
  const loadProgress = async (address: string) => {
    try {
      // In a real implementation, you would call the contract here
      // For demo purposes, we'll use localStorage
      const savedProgress = localStorage.getItem(`progress_${address}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // Submit answer
  const submitAnswer = async (huntId: number) => {
    const answer = answers[huntId]?.toLowerCase().trim();
    
    if (!answer) {
      setMessages({ ...messages, [huntId]: 'Please enter an answer!' });
      return;
    }

    setLoading({ ...loading, [huntId]: true });
    setMessages({ ...messages, [huntId]: '' });

    try {
      // Check if already completed
      if (progress.completedHunts.includes(huntId)) {
        setMessages({ ...messages, [huntId]: 'You already completed this hunt!' });
        setLoading({ ...loading, [huntId]: false });
        return;
      }

      // Verify answer (in production, this would be done by the smart contract)
      const hunt = TREASURE_HUNTS.find(h => h.id === huntId);
      const correctAnswers: { [key: number]: string } = {
        1: 'stellar',
        2: 'soroban'
      };

      if (answer === correctAnswers[huntId]) {
        // In production, call the smart contract here
        // await invokeContract('submit_answer', [walletAddress, huntId, answer]);
        
        // Update progress
        const newProgress = {
          completedHunts: [...progress.completedHunts, huntId],
          totalRewards: progress.totalRewards + (hunt?.reward || 0)
        };
        setProgress(newProgress);
        localStorage.setItem(`progress_${walletAddress}`, JSON.stringify(newProgress));
        
        setMessages({ ...messages, [huntId]: `🎉 Correct! You earned ${hunt?.reward} points!` });
        setAnswers({ ...answers, [huntId]: '' });
      } else {
        setMessages({ ...messages, [huntId]: '❌ Incorrect answer. Try again!' });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setMessages({ ...messages, [huntId]: 'Error submitting answer' });
    } finally {
      setLoading({ ...loading, [huntId]: false });
    }
  };

  const handleAnswerChange = (huntId: number, value: string) => {
    setAnswers({ ...answers, [huntId]: value });
  };

  const handleKeyPress = (huntId: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitAnswer(huntId);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🏴‍☠️ Virtual Treasure Hunt</h1>
        <p className="subtitle">Powered by Stellar & Soroban</p>
        {!isConnected ? (
          <button className="connect-btn" onClick={connectWallet}>
            Connect Freighter Wallet
          </button>
        ) : (
          <div className="wallet-info">
            <div className="wallet-address">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
            <div className="wallet-stats">
              <span>🏆 {progress.totalRewards} points</span>
              <span>✅ {progress.completedHunts.length}/{TREASURE_HUNTS.length} hunts</span>
            </div>
          </div>
        )}
      </header>

      {!isConnected ? (
        <div className="welcome-screen">
          <h2>Welcome, Treasure Hunter!</h2>
          <p>Connect your Freighter wallet to start hunting for digital treasures on the Stellar blockchain.</p>
          <div className="features">
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <h3>Solve Riddles</h3>
              <p>Answer blockchain-themed questions</p>
            </div>
            <div className="feature">
              <span className="feature-icon">💎</span>
              <h3>Earn Rewards</h3>
              <p>Collect points for correct answers</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🏆</span>
              <h3>Compete</h3>
              <p>Climb the leaderboard</p>
            </div>
          </div>
        </div>
      ) : (
        <main className="main-content">
          <div className="hunts-grid">
            {TREASURE_HUNTS.map((hunt) => {
              const isCompleted = progress.completedHunts.includes(hunt.id);
              
              return (
                <div key={hunt.id} className={`hunt-card ${isCompleted ? 'completed' : ''}`}>
                  <div className="hunt-header">
                    <h3>{hunt.name}</h3>
                    {isCompleted && <span className="completed-badge">✓ Completed</span>}
                  </div>
                  <p className="hunt-description">{hunt.description}</p>
                  <div className="hunt-reward">💰 Reward: {hunt.reward} points</div>
                  
                  <div className="riddle-box">
                    <h4>Riddle:</h4>
                    <p>{hunt.riddle}</p>
                  </div>

                  {!isCompleted && (
                    <div className="answer-section">
                      <input
                        type="text"
                        placeholder="Enter your answer..."
                        value={answers[hunt.id] || ''}
                        onChange={(e) => handleAnswerChange(hunt.id, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(hunt.id, e)}
                        disabled={loading[hunt.id]}
                        className="answer-input"
                      />
                      <button 
                        onClick={() => submitAnswer(hunt.id)}
                        disabled={loading[hunt.id]}
                        className="submit-btn"
                      >
                        {loading[hunt.id] ? 'Submitting...' : 'Submit Answer'}
                      </button>
                    </div>
                  )}

                  {messages[hunt.id] && (
                    <div className={`message ${messages[hunt.id].includes('Correct') ? 'success' : 'error'}`}>
                      {messages[hunt.id]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      )}

      <footer className="footer">
        <p>Built for Stellar Bootcamp | Contract: {CONTRACT_ID.slice(0, 8)}...</p>
      </footer>
    </div>
  );
}

export default App;