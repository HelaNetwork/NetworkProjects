// src/config.js
export const HELA_CHAIN_ID = 666888;
export const HELA_RPC_URL = "https://testnet-rpc.helachain.com";

// 👇 REPLACE WITH YOUR ADDRESSES 👇
export const PAYSTREAM_ADDRESS = "0x5E40Fe27d3CA6BD463A408ff94c98259C03C3742"; 
export const TOKEN_ADDRESS = "0x982961771df729EB5acACd59c0daA4CB797a4F3D"; 

export const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)"
];

export const PAYSTREAM_ABI = [
  // --- READ FUNCTIONS ---
  "function hr() view returns (address)",
  "function platformOwner() view returns (address)",
  "function offRampEnabled() view returns (bool)",
  "function yieldRateBps() view returns (uint16)",
  "function platformFeePercent() view returns (uint8)",
  "function defaultTaxPercent() view returns (uint8)",
  "function exchangeRates(uint8) view returns (uint256)",
  
  // Dashboard Data
  "function getHRDashboard() view returns (uint256 treasury, uint256 totalTax, uint256 totalPlatformFees, uint256 totalYield, uint256 liability, uint256 employeeCount, uint256 activeCount, uint256 contractBal)",
  "function getEmployeeSalaryInfo(address) view returns (uint256 grossEarned, uint256 netEarned, uint256 taxAmount, uint256 platformFee, uint256 totalWithdrawn, uint256 salaryPerSecond, bool isActive, bool isPaused)",
  "function getEmployeeYieldInfo(address) view returns (uint256 yieldPending, uint256 yieldClaimable)",
  "function getEmployeeBonusInfo(address) view returns (uint256 pendingBonuses, uint256 claimableBonuses)",
  
  // Lists & Maps
  "function employeeList(uint256) view returns (address)",
  "function streams(address) view returns (uint256 salaryPerSecond, uint48 startTime, uint48 lastClaimTime, uint8 taxPercent, bool active, bool paused, uint256 withdrawn)",
  "function getScheduledBonusCount(address) view returns (uint256)",
  "function getScheduledBonus(address, uint256) view returns (uint256 amount, uint48 releaseTime, bool claimed, bool exists)",
  "function getOffRampCount(address) view returns (uint256)",
  "function getOffRampRequest(address, uint256) view returns (uint256 amount, uint48 timestamp, uint8 currencyCode, bool processed, bool exists)",

  // --- WRITE FUNCTIONS (HR) ---
  "function deposit(uint256 amount)",
  "function startStream(address employee, uint256 salaryPerSecond)",
  "function updateSalary(address employee, uint256 newRate)",
  "function terminateEmployee(address employee)",
  "function pauseStream(address employee)",
  "function resumeStream(address employee)",
  "function updateTax(address employee, uint256 newTaxPercent)", 
  "function collectTax()",
  
  // Bonus & Off-Ramp (HR)
  "function scheduleBonus(address employee, uint256 amount, uint48 releaseTime)",
  "function cancelScheduledBonus(address employee, uint256 bonusIndex)",
  "function distributeYield(address employee)",
  "function updateExchangeRate(uint8 currencyCode, uint256 rate)",
  "function toggleOffRamp()",
  "function processOffRamp(address employee, uint256 requestIndex)",

  // --- WRITE FUNCTIONS (PLATFORM OWNER) ---
  "function collectPlatformFees()",
  "function updatePlatformFee(uint256 newFeePercent)",
  "function updateYieldRate(uint16 newRateBps)",

  // --- WRITE FUNCTIONS (EMPLOYEE) ---
  "function withdrawSalary()",
  "function claimYield()",
  "function claimScheduledBonus(uint256 bonusIndex)",
  "function requestOffRamp(uint256 amount, uint8 currencyCode)"
];