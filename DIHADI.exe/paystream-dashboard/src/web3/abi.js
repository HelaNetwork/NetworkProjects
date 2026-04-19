// export const PAYSTREAM_ABI = [
//   "function depositTreasury(uint256 amount)",
//   "function startStream(address employee,uint256 monthlySalary,uint256 taxPercent)",
//   "function pauseStream(address employee)",
//   "function cancelStream(address employee)",
//   "function withdraw()",
//   "function payBonus(address employee,uint256 amount)",
//   "function updateTaxVault(address newVault)",
//   "function treasuryBalance() view returns(uint256)",
//   "function earned(address employee) view returns(uint256)",
//   "function owner() view returns(address)"
// ];

export const PAYSTREAM_ABI = [

  // Constructor
  "constructor(address _taxVault)",

  // Events
  "event BonusPaid(address indexed employee, uint256 amount)",
  "event EmergencyWithdraw(uint256 amount)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event StreamCancelled(address indexed employee)",
  "event StreamPaused(address indexed employee)",
  "event StreamStarted(address indexed employee, uint256 monthlySalary, uint256 startTime, uint256 endTime)",
  "event TaxVaultUpdated(address newVault)",
  "event TreasuryFunded(address indexed from, uint256 amount)",
  "event Withdrawn(address indexed employee, uint256 employeeAmount, uint256 taxAmount)",

  // Functions
  "function cancelStream(address employee)",
  "function claimBonus(uint256 index)",
  "function depositTreasury() payable",
  "function earned(address employee) view returns (uint256)",
  "function emergencyWithdraw(uint256 amount)",
  "function owner() view returns (address)",
  "function pauseStream(address employee)",
  "function payBonus(address employee) payable",
  "function renounceOwnership()",
  "function scheduleBonus(address employee, uint256 unlockTime) payable",
  "function scheduledBonuses(address, uint256) view returns (uint256 amount, uint256 unlockTime, bool claimed)",
  "function startStream(address employee, uint256 monthlySalary, uint256 taxPercent, uint256 duration, uint256 cliffDuration)",
  "function streams(address) view returns (uint256 monthlySalary, uint256 salaryPerSecond, uint256 startTime, uint256 endTime, uint256 cliffDuration, uint256 lastWithdrawTime, uint256 accrued, uint256 taxPercent, bool active)",
  "function taxVault() view returns (address)",
  "function totalAccruedLiability() view returns (uint256)",
  "function totalActiveStreams() view returns (uint256)",
  "function transferOwnership(address newOwner)",
  "function treasuryBalance() view returns (uint256)",
  "function updateTaxVault(address newVault)",
  "function withdraw()",

  // Receive
  "receive() payable"
];


export const ERC20_ABI = [
  "function approve(address spender,uint256 amount) returns(bool)",
  "function allowance(address owner,address spender) view returns(uint256)",
  "function balanceOf(address account) view returns(uint256)",
  "function transfer(address to,uint256 amount) returns(bool)",
  "function transferFrom(address from,address to,uint256 amount) returns(bool)",
  "function decimals() view returns(uint8)",
  "function symbol() view returns(string)",
  "function name() view returns(string)"
];