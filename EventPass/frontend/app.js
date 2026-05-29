const connectWalletBtn = document.getElementById('connectWalletBtn');
const mintTicketBtn = document.getElementById('mintTicketBtn');
const ticketQuantity = document.getElementById('ticketQuantity');
const mintStatus = document.getElementById('mintStatus');

const withdrawBankBtn = document.getElementById('withdrawBankBtn');
const creatorBalance = document.getElementById('creatorBalance');
const withdrawAmount = document.getElementById('withdrawAmount');

const borrowBtn = document.getElementById('borrowBtn');
const repayBtn = document.getElementById('repayBtn');
const repScore = document.getElementById('repScore');
const activeLoan = document.getElementById('activeLoan');
const creditStatus = document.getElementById('creditStatus');

let provider;
let signer;
let userAddress;

// Mock ABIs and Addresses (In a real app, these would come from hardhat deployment)
const EVENT_TICKET_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder
const CREATOR_BANK_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder
const REPUTATION_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder

const TICKET_PRICE = 0.01;

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            userAddress = await signer.getAddress();
            
            connectWalletBtn.innerText = userAddress.substring(0, 6) + '...' + userAddress.substring(38);
            connectWalletBtn.style.background = 'var(--secondary)';
            connectWalletBtn.style.color = 'var(--background)';
            
            // Mock data load for demo purposes
            loadUserData();
        } catch (error) {
            console.error("User rejected connection", error);
        }
    } else {
        alert('Please install MetaMask!');
    }
}

function loadUserData() {
    // In reality, read from contracts using ethers.js
    // Mocking for the UI template preview
    repScore.innerText = "120"; // High enough to borrow
    activeLoan.innerText = "0.00";
    creatorBalance.innerText = "2.50";
}

connectWalletBtn.addEventListener('click', connectWallet);

mintTicketBtn.addEventListener('click', async () => {
    if (!signer) return alert("Please connect wallet first");
    
    mintTicketBtn.disabled = true;
    mintTicketBtn.innerText = "Minting...";
    mintStatus.innerText = "Confirm transaction in your wallet...";
    
    // Mock transaction delay
    setTimeout(() => {
        const qty = ticketQuantity.value;
        mintTicketBtn.disabled = false;
        mintTicketBtn.innerText = "Mint Ticket";
        mintStatus.innerText = `Successfully minted ${qty} ticket(s)!`;
        mintStatus.style.color = "var(--secondary)";
        
        // Slightly increase reputation score
        repScore.innerText = parseInt(repScore.innerText) + (qty * 5);
    }, 2000);
});

borrowBtn.addEventListener('click', async () => {
    if (!signer) return alert("Please connect wallet first");
    if (activeLoan.innerText !== "0.00") return alert("You already have an active loan");
    
    creditStatus.innerText = "Requesting uncollateralized loan...";
    
    setTimeout(() => {
        activeLoan.innerText = "0.10";
        creditStatus.innerText = "Loan of 0.1 ETH approved based on reputation!";
        creditStatus.style.color = "var(--secondary)";
    }, 1500);
});

repayBtn.addEventListener('click', async () => {
    if (!signer) return alert("Please connect wallet first");
    if (activeLoan.innerText === "0.00") return alert("No active loan to repay");
    
    creditStatus.innerText = "Repaying loan...";
    
    setTimeout(() => {
        activeLoan.innerText = "0.00";
        repScore.innerText = parseInt(repScore.innerText) + 15; // Boost score on repay
        creditStatus.innerText = "Loan repaid successfully. Reputation boosted!";
        creditStatus.style.color = "var(--secondary)";
    }, 1500);
});

withdrawBankBtn.addEventListener('click', async () => {
    if (!signer) return alert("Please connect wallet first");
    const amt = parseFloat(withdrawAmount.value);
    const bal = parseFloat(creatorBalance.innerText);
    
    if (isNaN(amt) || amt <= 0) return alert("Enter valid amount");
    if (amt > bal) return alert("Insufficient balance in Creator Bank");
    
    withdrawBankBtn.innerText = "Processing...";
    
    setTimeout(() => {
        creatorBalance.innerText = (bal - amt).toFixed(2);
        withdrawBankBtn.innerText = "Withdraw / Swap";
        alert(`Successfully withdrew ${amt} ETH from Creator Bank!`);
    }, 1500);
});
