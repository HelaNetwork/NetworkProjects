# PayStream V2 - Corporate Payroll Streaming Protocol 🌊💸

PayStream V2 is a decentralized payroll protocol built on the **HeLa Testnet**. It revolutionizes traditional monthly salaries by **streaming wages second-by-second**, automating compliance (tax/fees), and enabling DeFi features like yield generation and fiat off-ramping directly from the payroll dashboard.

### 🔗 Project Links
- **🚀 Live Demo:** https://paystreamv2tokentitans.vercel.app/
- **🎥 Demo Video:** https://youtu.be/VxcjyU0x69Q
- **📄 Contract Repo:** [INSERT YOUR GITHUB REPO URL HERE]

---

## 🌟 Key Features (Hackathon Submission)

We have implemented a full suite of corporate payroll features. Judges, please test the following:

### 👑 For HR / Employers
- **✅ Real-Time Salary Streaming:** Create streams that pay employees by the second. Watch the balance tick up in real-time!
- **✅ Automated Tax Collection:** A configurable % is automatically deducted from every second of salary and sent to a Tax Vault.
- **✅ Control Tax Rates:** HR can update the specific **Tax Percent** for any employee at any time.
- **✅ Yield Management:** - **Control Yield Percent:** HR can set the global **Yield Rate (BPS)** offered to employees.
  - **Distribute Yield:** HR can manually trigger **Yield Distribution** (🪙 icon) to credit employees with accrued interest.
- **✅ Bonus Management:**
  - **Instant Bonus:** Send a reward immediately.
  - **Time-Locked Bonus:** Schedule a bonus for a future date. It remains locked until the timer expires.
- **✅ Employee Management:** Pause, Resume, or **Terminate** (settles final dues) via the employee list.

### 👷 For Employees
- **✅ Sticky Live Salary Ticker:** A visual dashboard showing earnings increasing every second. **Note:** The balance is "sticky" and persists even if the stream is paused or the page is refreshed.
- **✅ Status Indicators:** Clear labels showing if your stream is **ACTIVE**, **PAUSED**, or **TERMINATED**.
- **✅ Claim Bonus:** View all scheduled bonuses and claim them once the time-lock expires.
- **✅ DeFi Yield:** Earn interest on your unclaimed salary and claim it to your wallet.
- **✅ Fiat Off-Ramp:** Request to convert your crypto salary to Fiat (INR/USD).

### 🛠️ For Developers / Protocol Owners
- **✅ Sustainable Revenue Model:** The protocol charges a configurable **Platform Fee** on every salary stream.
- **✅ Admin Lock Screen:** Secure access to the Developer Dashboard via password (`admin123`).

---

## 📂 Project Structure

```text
PAYSTREAM-UI/
├── contracts/
│   ├── HeLaRupees.sol      (ERC20 Salary Token)
│   └── PayStreamV2.sol     (Payroll Logic)
├── src/
│   ├── App.jsx             (Frontend Logic)
│   ├── config.js           (Contract ABIs & Env Loader)
│   └── App.css             (Styling)
├── .env                    (Network & Contract Config)
├── package.json
└── README.md

```

🚀 Quick Start

- **Clone and Install**

```bash
git clone https://github.com/b25354-cloud/KrackHack-Blockchain-TokenTitans
cd paystream-v2
npm install
```
- **Environment Setup**
Ensure your .env file contains the correct contract addresses and RPC:
``` bash
VITE_HELA_CHAIN_ID=666888
VITE_HELA_RPC_URL=[https://testnet-rpc.helachain.com](https://testnet-rpc.helachain.com)
VITE_PAYSTREAM_ADDRESS=0x5E40Fe27d3CA6BD463A408ff94c98259C03C3742
VITE_TOKEN_ADDRESS=0x982961771df729EB5acACd59c0daA4CB797a4F3D
```
- **Run Locally**
```bash
npm run dev
```

- **🦊 Wallet Setup & Testing Guide**
- 1. Add HeLa Testnet to MetaMask
     - RPC URL: https://testnet-rpc.helachain.com
     - Chain ID: 666888
     - Currency: HLUSD
       
- 2. Get Gas Tokens (Required)
     - Both HR and Employees need native HLUSD to pay for gas.
     - 👉 Get tokens at the HeLa Faucet(https://testnet-faucet.helachain.com/).
       
- 3. Import Salary Token (HRS)
     To see your salary in MetaMask, import the HRS token:
     1. MetaMask -> Assets -> Import Tokens.
     2. Paste Address: 0x982961771df729EB5acACd59c0daA4CB797a4F3D
     3. Symbol: HRS | Decimals: 18.
       
- **📜 Deployed Contracts & Proof of WorkContract **
  - PayStreamV2 : "0x5E40Fe27d3CA6BD463A408ff94c98259C03C3742"
  - HeLaRupees (HRS) : "0x982961771df729EB5acACd59c0daA4CB797a4F3D"

    
- **🧪 Example Transactions **
- Start Stream (Post): "0xa927570927a62c237a15cea8947ed43240633c15d282096bd758d2f924278db7"
- Withdraw Salary (Interact): "0xdbab7c93d74e5e499f3f44f9e3561b351287cafc5ec0b43c103f0b33e2270786"
- Schedule Bonus *(from HR) : "0x3b724ff2c8c375fa62fd6cb3e4825688098e7abfcb88ce5ef3f37973adfa24ef"
- Claim Bonus (Tip): "0xe2a306f5c06b68360af1d848036f58980df60be544cb3a3f815e0024beebdc6a"

- **🎬 How to Demo (Step-by-Step) **
- 
- Step 1: HR View (Account 1)Mint & Deposit:
   - Go to Treasury, click Mint 10k Tokens, then enter 5000 and click Approve & Deposit.
   - Start Stream: In the Employees tab, paste Account 2's address.
   - Enter 0.01 in the Rate box.
   - Click + Stream.Schedule Bonus: Click the Gift (🎁) icon. Amt: 500, Mins Delay: 0.Click Schedule.
   - 
- Step 2: Employee View (Account 2)
   - Switch Account: Switch MetaMask to Account 2.
   - Live Ticker: Watch the salary increase. Status will show ACTIVE STREAMING.
   - Withdraw: Click Withdraw to claim your streamed salary.
     
- Step 3: Developer ViewSwitch back to Account 1.
   - Click Switch to Developer (Top Right).
   - Password: admin123.
   - Update Platform Fee % to test protocol revenue logic.
     
- **Tech Stack**

    Frontend: React, Vite, Ethers.js v6
    Smart Contracts: Solidity 0.8.20
    Network: HeLa Chain Testnet (Chain ID: 666888)
