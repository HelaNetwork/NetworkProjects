# CareerLens - AI Job Tracker with Blockchain Verification

CareerLens is an AI-powered Chrome Extension that helps job seekers track job applications and verify company authenticity using Polygon blockchain.

## Features
- AI-powered job tracking dashboard
- Blockchain-based company verification on Polygon Amoy Testnet
- Smart contract for storing verified job records
- Chrome Extension for one-click job saving
- Resume match scoring using NLP

## Tech Stack
- Frontend: HTML, CSS, JavaScript (Chrome Extension)
- Backend: Node.js + Express
- Blockchain: Solidity Smart Contract on Polygon Amoy
- AI: Python NLP for resume matching
- Database: MongoDB

## Setup
1. Clone the repo
2. Run `npm install`
3. Deploy smart contract: `npx hardhat run scripts/deploy.js --network amoy`
4. Load Chrome Extension from `/extension` folder

## Smart Contract
Deployed on Polygon Amoy Testnet
- Contract: JobVerification.sol
- Network: Polygon Amoy (Chain ID: 80002)
