export const MOCK_EMPLOYEES = [
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    rate: "0.0004",
    tax: "10",
    active: true,
    exists: true,
    accrued: "12.4500",
    name: "Alice Johnson",
  },
  {
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    rate: "0.0003",
    tax: "12",
    active: true,
    exists: true,
    accrued: "8.2100",
    name: "Bob Smith",
  },
  {
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    rate: "0.0005",
    tax: "8",
    active: false,
    exists: true,
    accrued: "3.0000",
    name: "Charlie Davis",
  },
  {
    address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    rate: "0.0002",
    tax: "15",
    active: true,
    exists: true,
    accrued: "5.7800",
    name: "Diana Lee",
  },
];

export const MOCK_HR_DATA = {
  treasuryBalance: "25000.0000",
  taxVault: "1250.5000",
  yieldAccrued: "62.5000",
  totalBonuses: "3500.0000",
};

export const MOCK_EMPLOYEE_STREAM = {
  ratePerSecond: BigInt("385802469135802"), // ~1000 HLUSD/month
  startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 15), // started 15 days ago
  lastWithdrawTime: BigInt(Math.floor(Date.now() / 1000) - 3600), // last withdraw 1 hour ago
  taxPercent: BigInt(10),
  active: true,
  exists: true,
};

export const MOCK_ACCRUED = "14.2850";

export const MOCK_WITHDRAWAL_HISTORY = [
  { time: "2:30 PM", gross: "50.0000", tax: "5.0000", net: "45.0000" },
  { time: "10:15 AM", gross: "32.5000", tax: "3.2500", net: "29.2500" },
  { time: "Yesterday", gross: "75.0000", tax: "7.5000", net: "67.5000" },
];

export const MOCK_INVEST_HISTORY = [
  { time: "2:30 PM", amount: "9.0000", type: "Auto-Invest" },
  { time: "10:15 AM", amount: "5.8500", type: "Auto-Invest" },
];

export const MOCK_WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
