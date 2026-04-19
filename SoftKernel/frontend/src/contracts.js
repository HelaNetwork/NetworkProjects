// export const TREASURY_ADDRESS = "0xffA79E306f877370e2592Ba4030D1a869C1f4B4a";
// export const STREAM_ADDRESS = "0xeD878261E8cA28d0E50Fc9F74B606cf93A5a9A46";
export const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_CONTRACT;
export const STREAM_ADDRESS = import.meta.env.VITE_STREAM_CONTRACT;
export const OFFRAMP_ADDRESS = import.meta.env.VITE_OFFRAMP_CONTRACT;   

export const TREASURY_ABI = [
  "function deposit(uint256 companyId) external payable",
  "function companyBalances(address, uint256) external view returns (uint256)",
  "function companyReserved(address, uint256) external view returns (uint256)",
  "function getAvailableBalance(address employer, uint256 companyId) external view returns (uint256)",
  "function getTreasuryBalance() external view returns (uint256)",
  "function claimYield(uint256 companyId) external",
  "function getAccruedYield(address employer, uint256 companyId) external view returns (uint256)",
  "function getYieldStats(address employer, uint256 companyId) external view returns (uint256 reserved, uint256 accruedYield, uint256 totalYieldClaimed, uint256 annualYieldPercent, uint256 lastClaimTimestamp)",
  "function totalYieldPaidGlobal() external view returns (uint256)",
  "function annualYieldPercent() external view returns (uint256)",
  "function lastYieldClaim(address, uint256) external view returns (uint256)",
  "function totalYieldClaimed(address, uint256) external view returns (uint256)",
  "event Deposited(address indexed employer, uint256 indexed companyId, uint256 amount)",
  "event YieldClaimed(address indexed employer, uint256 indexed companyId, uint256 amount, uint256 reserved, uint256 elapsed)"
];

export const STREAM_ABI = [
  // Company
  "function createCompany(string calldata name) external returns (uint256)",
  "function updateCompanyName(uint256 companyId, string calldata newName) external",
  "function companyCounter() external view returns (uint256)",
  "function companies(uint256) external view returns (string name, address creator, uint256 createdAt, bool exists)",
  "function getCompany(uint256 id) external view returns (string name, address creator, uint256 createdAt, bool exists_)",
  "function getUserCompanies(address user) external view returns (uint256[])",

  // Roles
  "function companyRoles(uint256, address) external view returns (uint8)",
  "function addCEO(uint256 companyId, address account) external",
  "function addHR(uint256 companyId, address account) external",
  "function removeCEO(uint256 companyId, address account) external",
  "function removeHR(uint256 companyId, address account) external",
  "function getCompanyRoles(uint256 companyId) external view returns (address[] members, uint8[] roles)",

  // Employees
  "function addEmployee(uint256 companyId, address employee) external",
  "function removeEmployee(uint256 companyId, address employee) external",
  "function isCompanyEmployee(uint256, address) external view returns (bool)",
  "function getCompanyEmployees(uint256 companyId) external view returns (address[])",

  // Streams
  "function createStream(uint256 companyId, address employee, uint256 monthlySalary, uint256 durationInMonths, uint256 taxPercent) external",
  "function withdraw() external",
  "function streams(address) external view returns (address employer, uint256 companyId, uint256 monthlySalary, uint256 ratePerSecond, uint256 startTime, uint256 endTime, uint256 withdrawn, uint256 totalAllocated, uint256 taxPercent, bool paused, bool exists)",
  "function getWithdrawable(address) external view returns (uint256)",
  "function getEarned(address) external view returns (uint256)",
  "function getStreamDetails(address) external view returns (tuple(address employer, uint256 companyId, uint256 monthlySalary, uint256 ratePerSecond, uint256 startTime, uint256 endTime, uint256 withdrawn, uint256 totalAllocated, uint256 taxPercent, bool paused, bool exists))",
  "function hasStream(address) external view returns (bool)",
  "function pauseStream(address) external",
  "function resumeStream(address) external",
  "function cancelStream(address) external",

  // Company analytics
  "function getCompanyStats(uint256 companyId) external view returns (uint256 totalEmployees, uint256 activeStreams, uint256 totalReserved, uint256 totalPaid)",
  "function getCompanyStreamEmployees(uint256 companyId) external view returns (address[])",
  "function getEmployeeCompany(address employee) external view returns (uint256 companyId, bool found)",
  "function companyReserved(uint256) external view returns (uint256)",
  "function companyPaid(uint256) external view returns (uint256)",

  // Global
  "function admin() external view returns (address)",
  "function getAllEmployees() external view returns (address[])",
  "function getActiveEmployees() external view returns (address[])",
  "function getEmployeesByEmployer(address) external view returns (address[])",
  "function getGlobalStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256)",
  "function getTotalWithdrawable() external view returns (uint256)",
  "function getEmployerStats(address) external view returns (uint256, uint256, uint256, uint256)",

  // Bonus
  "function scheduleBonus(address employee, uint256 amount, uint256 unlockTime) external",
  "function getEmployeeBonuses(address) external view returns (tuple(uint256 amount, uint256 unlockTime, bool claimed)[])",
  "function getPendingBonusTotal(address) external view returns (uint256)",
  "function getBonusStats() external view returns (uint256 totalScheduled, uint256 totalPaid, uint256 totalLiability)",

  // Events
  "event CompanyCreated(uint256 indexed companyId, string name, address indexed creator)",
  "event RoleAssigned(uint256 indexed companyId, address indexed account, uint8 role)",
  "event RoleRevoked(uint256 indexed companyId, address indexed account, uint8 previousRole)",
  "event EmployeeAdded(uint256 indexed companyId, address indexed employee)",
  "event EmployeeRemoved(uint256 indexed companyId, address indexed employee)",
  "event CompanyNameUpdated(uint256 indexed companyId, string newName)",
  "event StreamCreated(address indexed employer, address indexed employee, uint256 monthlySalary, uint256 durationMonths, uint256 taxPercent, uint256 startTime)",
  "event StreamCreatedCompany(uint256 indexed companyId, address indexed employee, uint256 monthlySalary, uint256 durationMonths, uint256 taxPercent)",
  "event Withdrawn(address indexed employee, uint256 netAmount, uint256 taxAmount)",
  "event StreamPaused(address indexed employee)",
  "event StreamResumed(address indexed employee)",
  "event StreamCancelled(address indexed employee, uint256 refundAmount)",
  "event BonusScheduled(address indexed employee, uint256 amount, uint256 unlockTime, uint256 bonusIndex)",
  "event BonusClaimed(address indexed employee, uint256 amount, uint256 bonusIndex)"
];

export const OFFRAMP_ABI = [
  "function oracleSigner() external view returns (address)",
  "function feePercent() external view returns (uint256)",
  "function totalVolumeHLUSD() external view returns (uint256)",
  "function totalFeesCollected() external view returns (uint256)",
  "function totalConversions() external view returns (uint256)",
  "function convertToFiat(uint256 rate, uint256 timestamp, bytes calldata signature) external payable",
  "function conversions(uint256) external view returns (address user, uint256 hlusdAmount, uint256 inrAmount, uint256 feeAmount, uint256 rateUsed, uint256 timestamp)",
  "function getUserConversions(address user) external view returns (uint256[])",
  "function getConversion(uint256 conversionId) external view returns (tuple(address user, uint256 hlusdAmount, uint256 inrAmount, uint256 feeAmount, uint256 rateUsed, uint256 timestamp))",
  "function getStats() external view returns (uint256 volume, uint256 fees, uint256 count)",
  "function withdrawFees(address payable recipient) external",
  "event ConversionExecuted(uint256 indexed conversionId, address indexed user, uint256 hlusdAmount, uint256 inrAmount, uint256 feeAmount, uint256 rateUsed, uint256 timestamp)",
  "event FeesWithdrawn(address indexed recipient, uint256 amount)"
];