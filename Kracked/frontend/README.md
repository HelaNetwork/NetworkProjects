# PayStream Frontend

This is the frontend for PayStream, a real-time payroll streaming application built on HeLa Testnet. It allows HR to create salary streams and employees to see their earnings increase live and withdraw anytime.

The frontend is built using Next.js and interacts directly with the PayStream smart contract using ethers.js and MetaMask.

---

# Requirements

Node.js 18 or newer
MetaMask browser extension

MetaMask must be connected to HeLa Testnet.

---

# Installation

Install dependencies:

npm install

Run development server:

npm run dev

Open in browser:

http://localhost:3000

---

# Production Build

To build and run production version:

npm run build
npm start

---

# Configuration

Contract address is defined in:

src/config/contract.js

Make sure it matches the deployed contract address on HeLa Testnet.

Network details:

Network Name: HeLa Testnet
Chain ID: 666888
RPC URL: https://testnet-rpc.helachain.com

---

# How to Use

HR

Connect MetaMask using HR wallet
Deposit HLUSD
Create salary streams

Employee

Connect MetaMask using employee wallet
View real-time earnings
Withdraw available balance

---

# Structure

src/app
Main pages and dashboards

src/components
UI components

src/utils
Contract interaction logic

src/config
Contract address configuration

---

# Notes

Frontend connects directly to the deployed smart contract.

No backend server is required to run the frontend.
