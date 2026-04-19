// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ITreasury {
    function reserveFunds(address employer, uint256 companyId, uint256 amount) external;
    function releaseSalary(address employer, uint256 companyId, address to, uint256 amount) external;
}

/**
 * @title SalaryStream
 * @notice Multi-company on-chain payroll governance with real-time per-second streaming,
 *         tax redirection, and scheduled bonuses using native HLUSD
 * @dev Company-scoped role-based access: CEO / HR / Employee
 * @dev Per-second streaming: earnings = ratePerSecond * elapsed
 * @dev HLUSD is native asset — all transfers use treasury custody
 */
contract SalaryStream {

    // ========== ENUMS ==========

    enum Role {
        NONE,
        HR,
        CEO
    }

    // ========== STRUCTS ==========

    struct Company {
        string name;
        address creator;
        uint256 createdAt;
        bool exists;
    }

    struct Bonus {
        uint256 amount;
        uint256 unlockTime;
        bool claimed;
    }

    struct Stream {
        address employer;
        uint256 companyId;
        uint256 monthlySalary;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 endTime;
        uint256 withdrawn;
        uint256 totalAllocated;
        uint256 taxPercent;
        bool paused;
        bool exists;
    }

    // ========== STATE VARIABLES ==========

    address public admin;
    ITreasury public immutable treasury;
    address public taxVault;

    uint256 private constant SECONDS_PER_MONTH = 30 days;

    // ---- Company ----
    uint256 public companyCounter;
    mapping(uint256 => Company) public companies;
    mapping(address => uint256[]) public userCompanies;
    mapping(uint256 => mapping(address => Role)) public companyRoles;
    mapping(uint256 => address[]) internal _companyEmployees;
    mapping(uint256 => mapping(address => bool)) public isCompanyEmployee;
    mapping(uint256 => address[]) internal _companyRoleMembers;
    mapping(uint256 => mapping(address => uint256)) private _roleMemberIdx;
    mapping(uint256 => mapping(address => bool)) private _isRoleMemberTracked;
    mapping(uint256 => uint256) public companyReserved;
    mapping(uint256 => uint256) public companyPaid;

    // ---- Global employee indexing ----
    address[] public allEmployees;
    mapping(address => bool) public isEmployee;
    mapping(address => address[]) public employerToEmployees;
    mapping(address => bool) public hasActiveStream;
    address[] public activeEmployees;
    mapping(address => uint256) private activeIndex;

    uint256 public totalStreamsCreated;
    uint256 public totalActiveStreams;
    uint256 public totalReservedGlobal;
    uint256 public totalPaidGlobal;

    // ---- Bonus ----
    mapping(address => Bonus[]) public employeeBonuses;
    uint256 public totalBonusesScheduled;
    uint256 public totalBonusesPaid;

    // ---- Streams ----
    mapping(address => Stream) public streams;
    mapping(uint256 => address[]) public companyStreamEmployees;

    // ========== EVENTS ==========

    event CompanyCreated(uint256 indexed companyId, string name, address indexed creator);
    event RoleAssigned(uint256 indexed companyId, address indexed account, Role role);
    event RoleRevoked(uint256 indexed companyId, address indexed account, Role previousRole);
    event EmployeeAdded(uint256 indexed companyId, address indexed employee);
    event EmployeeRemoved(uint256 indexed companyId, address indexed employee);
    event CompanyNameUpdated(uint256 indexed companyId, string newName);

    event StreamCreated(
        address indexed employer,
        address indexed employee,
        uint256 monthlySalary,
        uint256 durationMonths,
        uint256 taxPercent,
        uint256 startTime
    );
    event StreamCreatedCompany(
        uint256 indexed companyId,
        address indexed employee,
        uint256 monthlySalary,
        uint256 durationMonths,
        uint256 taxPercent
    );
    event Withdrawn(address indexed employee, uint256 netAmount, uint256 taxAmount);
    event StreamPaused(address indexed employee);
    event StreamResumed(address indexed employee);
    event StreamCancelled(address indexed employee, uint256 refundAmount);
    event TaxPaid(address indexed employee, uint256 amount);
    event TaxVaultUpdated(address indexed oldVault, address indexed newVault);
    event BonusScheduled(address indexed employee, uint256 amount, uint256 unlockTime, uint256 bonusIndex);
    event BonusClaimed(address indexed employee, uint256 amount, uint256 bonusIndex);

    // ========== CONSTRUCTOR ==========

    constructor(address _treasury, address _taxVault) {
        require(_treasury != address(0), "Invalid treasury");
        require(_taxVault != address(0), "Invalid tax vault");
        treasury = ITreasury(_treasury);
        taxVault = _taxVault;
        admin = msg.sender;
    }

    // ========== MODIFIERS ==========

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyCEO(uint256 companyId) {
        require(companies[companyId].exists, "Company not found");
        require(companyRoles[companyId][msg.sender] == Role.CEO, "Not CEO");
        _;
    }

    modifier onlyHRorCEO(uint256 companyId) {
        require(companies[companyId].exists, "Company not found");
        Role r = companyRoles[companyId][msg.sender];
        require(r == Role.HR || r == Role.CEO, "Not HR or CEO");
        _;
    }

    // =====================================================================
    //                        COMPANY FUNCTIONS
    // =====================================================================

    function createCompany(string calldata name) external returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");

        companyCounter++;
        uint256 id = companyCounter;

        companies[id] = Company({
            name: name,
            creator: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        companyRoles[id][msg.sender] = Role.CEO;
        userCompanies[msg.sender].push(id);
        _trackRoleMember(id, msg.sender);

        emit CompanyCreated(id, name, msg.sender);
        emit RoleAssigned(id, msg.sender, Role.CEO);
        return id;
    }

    function updateCompanyName(uint256 companyId, string calldata newName)
        external onlyCEO(companyId)
    {
        require(bytes(newName).length > 0, "Name cannot be empty");
        companies[companyId].name = newName;
        emit CompanyNameUpdated(companyId, newName);
    }

    // =====================================================================
    //                        ROLE MANAGEMENT
    // =====================================================================

    function addCEO(uint256 companyId, address account) external onlyCEO(companyId) {
        require(account != address(0), "Invalid address");
        require(companyRoles[companyId][account] != Role.CEO, "Already CEO");
        companyRoles[companyId][account] = Role.CEO;
        _trackRoleMember(companyId, account);
        userCompanies[account].push(companyId);
        emit RoleAssigned(companyId, account, Role.CEO);
    }

    function addHR(uint256 companyId, address account) external onlyCEO(companyId) {
        require(account != address(0), "Invalid address");
        require(companyRoles[companyId][account] == Role.NONE, "Already has role");
        companyRoles[companyId][account] = Role.HR;
        _trackRoleMember(companyId, account);
        userCompanies[account].push(companyId);
        emit RoleAssigned(companyId, account, Role.HR);
    }

    function removeCEO(uint256 companyId, address account) external onlyCEO(companyId) {
        require(companyRoles[companyId][account] == Role.CEO, "Not a CEO");
        require(account != msg.sender || _countCEOs(companyId) > 1, "Cannot remove last CEO");
        Role prev = companyRoles[companyId][account];
        companyRoles[companyId][account] = Role.NONE;
        _untrackRoleMember(companyId, account);
        emit RoleRevoked(companyId, account, prev);
    }

    function removeHR(uint256 companyId, address account) external onlyCEO(companyId) {
        require(companyRoles[companyId][account] == Role.HR, "Not HR");
        Role prev = companyRoles[companyId][account];
        companyRoles[companyId][account] = Role.NONE;
        _untrackRoleMember(companyId, account);
        emit RoleRevoked(companyId, account, prev);
    }

    // =====================================================================
    //                       EMPLOYEE MANAGEMENT
    // =====================================================================

    function addEmployee(uint256 companyId, address employee) external onlyHRorCEO(companyId) {
        require(employee != address(0), "Invalid address");
        require(!isCompanyEmployee[companyId][employee], "Already an employee");
        isCompanyEmployee[companyId][employee] = true;
        _companyEmployees[companyId].push(employee);
        emit EmployeeAdded(companyId, employee);
    }

    function removeEmployee(uint256 companyId, address employee) external onlyCEO(companyId) {
        require(isCompanyEmployee[companyId][employee], "Not an employee");
        require(
            !streams[employee].exists || streams[employee].companyId != companyId,
            "Active stream exists"
        );
        isCompanyEmployee[companyId][employee] = false;

        address[] storage emps = _companyEmployees[companyId];
        for (uint256 i = 0; i < emps.length; i++) {
            if (emps[i] == employee) {
                emps[i] = emps[emps.length - 1];
                emps.pop();
                break;
            }
        }
        emit EmployeeRemoved(companyId, employee);
    }

    // =====================================================================
    //                    STREAM MANAGEMENT (COMPANY-SCOPED)
    // =====================================================================

    function createStream(
        uint256 companyId,
        address employee,
        uint256 monthlySalary,
        uint256 durationInMonths,
        uint256 taxPercent
    ) external onlyHRorCEO(companyId) {
        require(employee != address(0), "Invalid employee");
        require(monthlySalary > 0, "Salary must be > 0");
        require(durationInMonths > 0, "Duration must be > 0");
        require(taxPercent <= 100, "Tax percent must be <= 100");
        require(!streams[employee].exists, "Stream exists");
        require(isCompanyEmployee[companyId][employee], "Not company employee");

        uint256 ratePerSecond = monthlySalary / SECONDS_PER_MONTH;
        require(ratePerSecond > 0, "Salary too low");

        uint256 totalSalary = monthlySalary * durationInMonths;
        address employer = companies[companyId].creator;

        treasury.reserveFunds(employer, companyId, totalSalary);

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + durationInMonths * SECONDS_PER_MONTH;

        streams[employee] = Stream({
            employer: employer,
            companyId: companyId,
            monthlySalary: monthlySalary,
            ratePerSecond: ratePerSecond,
            startTime: startTime,
            endTime: endTime,
            withdrawn: 0,
            totalAllocated: totalSalary,
            taxPercent: taxPercent,
            paused: false,
            exists: true
        });

        // Indexing
        if (!isEmployee[employee]) {
            allEmployees.push(employee);
            isEmployee[employee] = true;
        }
        employerToEmployees[employer].push(employee);
        companyStreamEmployees[companyId].push(employee);
        hasActiveStream[employee] = true;
        activeIndex[employee] = activeEmployees.length;
        activeEmployees.push(employee);

        companyReserved[companyId] += totalSalary;
        totalStreamsCreated += 1;
        totalActiveStreams += 1;
        totalReservedGlobal += totalSalary;

        emit StreamCreated(employer, employee, monthlySalary, durationInMonths, taxPercent, startTime);
        emit StreamCreatedCompany(companyId, employee, monthlySalary, durationInMonths, taxPercent);
    }

    function pauseStream(address employee) external {
        Stream storage s = streams[employee];
        require(s.exists, "Stream not found");
        _requireHRorCEO(s.companyId);
        require(!s.paused, "Already paused");
        s.paused = true;
        emit StreamPaused(employee);
    }

    function resumeStream(address employee) external {
        Stream storage s = streams[employee];
        require(s.exists, "Stream not found");
        _requireHRorCEO(s.companyId);
        require(s.paused, "Not paused");
        s.paused = false;
        emit StreamResumed(employee);
    }

    function cancelStream(address employee) external {
        Stream storage s = streams[employee];
        require(s.exists, "Stream not found");
        _requireHRorCEO(s.companyId);

        uint256 earned = _earned(employee);
        uint256 refund = s.totalAllocated - earned;
        uint256 cId = s.companyId;

        if (hasActiveStream[employee]) {
            uint256 idx = activeIndex[employee];
            uint256 last = activeEmployees.length - 1;
            if (idx != last) {
                address tail = activeEmployees[last];
                activeEmployees[idx] = tail;
                activeIndex[tail] = idx;
            }
            activeEmployees.pop();
            delete activeIndex[employee];
            hasActiveStream[employee] = false;
            totalActiveStreams -= 1;
        }

        uint256 remaining = s.totalAllocated - s.withdrawn;
        totalReservedGlobal -= remaining;
        companyReserved[cId] -= remaining;

        delete streams[employee];
        emit StreamCancelled(employee, refund);
    }

    // =====================================================================
    //                       EMPLOYEE FUNCTIONS
    // =====================================================================

    function withdraw() external {
        Stream storage s = streams[msg.sender];
        require(s.exists, "Stream not found");
        require(!s.paused, "Stream paused");

        uint256 streamW = _withdrawable(msg.sender);

        uint256 bonusTotal = 0;
        Bonus[] storage bonuses = employeeBonuses[msg.sender];
        for (uint256 i = 0; i < bonuses.length; i++) {
            if (bonuses[i].unlockTime <= block.timestamp && !bonuses[i].claimed) {
                bonusTotal += bonuses[i].amount;
                bonuses[i].claimed = true;
                totalBonusesPaid += bonuses[i].amount;
                emit BonusClaimed(msg.sender, bonuses[i].amount, i);
            }
        }

        uint256 gross = streamW + bonusTotal;
        require(gross > 0, "Nothing to withdraw");

        // Effects
        s.withdrawn += streamW;
        totalPaidGlobal += gross;
        totalReservedGlobal -= gross;
        companyPaid[s.companyId] += gross;
        companyReserved[s.companyId] -= gross;

        uint256 tax = (gross * s.taxPercent) / 100;
        uint256 net = gross - tax;
        address employer = s.employer;
        uint256 cId = s.companyId;

        // Interactions
        if (net > 0) treasury.releaseSalary(employer, cId, msg.sender, net);
        if (tax > 0) {
            treasury.releaseSalary(employer, cId, taxVault, tax);
            emit TaxPaid(msg.sender, tax);
        }

        emit Withdrawn(msg.sender, net, tax);
    }

    // =====================================================================
    //                        BONUS FUNCTIONS
    // =====================================================================

    function scheduleBonus(address employee, uint256 amount, uint256 unlockTime) external {
        require(streams[employee].exists, "Stream not found");
        uint256 cId = streams[employee].companyId;
        _requireHRorCEO(cId);
        require(amount > 0, "Amount must be > 0");
        require(unlockTime > block.timestamp, "Unlock must be in future");

        address employer = streams[employee].employer;
        treasury.reserveFunds(employer, cId, amount);

        totalReservedGlobal += amount;
        totalBonusesScheduled += amount;
        companyReserved[cId] += amount;

        employeeBonuses[employee].push(Bonus({
            amount: amount,
            unlockTime: unlockTime,
            claimed: false
        }));
        emit BonusScheduled(employee, amount, unlockTime, employeeBonuses[employee].length - 1);
    }

    // =====================================================================
    //                        ADMIN (LEGACY)
    // =====================================================================

    function setTaxVault(address v) external onlyAdmin {
        require(v != address(0), "Invalid address");
        address old = taxVault;
        taxVault = v;
        emit TaxVaultUpdated(old, v);
    }

    function transferAdmin(address a) external onlyAdmin {
        require(a != address(0), "Invalid address");
        admin = a;
    }

    // =====================================================================
    //                        VIEW FUNCTIONS
    // =====================================================================

    function getCompany(uint256 id) external view returns (
        string memory name, address creator, uint256 createdAt, bool exists_
    ) {
        Company storage c = companies[id];
        return (c.name, c.creator, c.createdAt, c.exists);
    }

    function getUserCompanies(address user) external view returns (uint256[] memory) {
        return userCompanies[user];
    }

    function getCompanyEmployees(uint256 companyId) external view returns (address[] memory) {
        return _companyEmployees[companyId];
    }

    function getCompanyRoles(uint256 companyId) external view returns (
        address[] memory members, Role[] memory roles
    ) {
        address[] storage mList = _companyRoleMembers[companyId];
        uint256 len = mList.length;
        members = new address[](len);
        roles = new Role[](len);
        for (uint256 i = 0; i < len; i++) {
            members[i] = mList[i];
            roles[i] = companyRoles[companyId][mList[i]];
        }
    }

    function getCompanyStats(uint256 companyId) external view returns (
        uint256 totalEmployees,
        uint256 activeStreams,
        uint256 totalReserved,
        uint256 totalPaid_
    ) {
        totalEmployees = _companyEmployees[companyId].length;
        totalReserved = companyReserved[companyId];
        totalPaid_ = companyPaid[companyId];
        address[] storage se = companyStreamEmployees[companyId];
        for (uint256 i = 0; i < se.length; i++) {
            if (streams[se[i]].exists && !streams[se[i]].paused) activeStreams++;
        }
    }

    function getCompanyStreamEmployees(uint256 companyId) external view returns (address[] memory) {
        return companyStreamEmployees[companyId];
    }

    function getEmployeeCompany(address employee) external view returns (uint256 companyId, bool found) {
        if (streams[employee].exists) return (streams[employee].companyId, true);
        return (0, false);
    }

    function getEarned(address employee) external view returns (uint256) {
        if (!streams[employee].exists) return 0;
        return _earned(employee);
    }

    function getWithdrawable(address employee) external view returns (uint256) {
        if (!streams[employee].exists) return 0;
        if (streams[employee].paused) return 0;
        return _withdrawable(employee);
    }

    function getStreamDetails(address employee) external view returns (Stream memory) {
        return streams[employee];
    }

    function hasStream(address employee) external view returns (bool) {
        return streams[employee].exists;
    }

    function getAllEmployees() external view returns (address[] memory) {
        return allEmployees;
    }

    function getActiveEmployees() external view returns (address[] memory) {
        return activeEmployees;
    }

    function getEmployeesByEmployer(address employer) external view returns (address[] memory) {
        return employerToEmployees[employer];
    }

    function getEmployeeBonuses(address employee) external view returns (Bonus[] memory) {
        return employeeBonuses[employee];
    }

    function getPendingBonusTotal(address employee) external view returns (uint256) {
        uint256 t = 0;
        Bonus[] storage b = employeeBonuses[employee];
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i].unlockTime <= block.timestamp && !b[i].claimed) t += b[i].amount;
        }
        return t;
    }

    function getBonusStats() external view returns (uint256, uint256, uint256) {
        return (totalBonusesScheduled, totalBonusesPaid, totalBonusesScheduled - totalBonusesPaid);
    }

    function getGlobalStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        return (totalStreamsCreated, totalActiveStreams, totalReservedGlobal, totalPaidGlobal, totalBonusesScheduled, totalBonusesPaid);
    }

    function getTotalWithdrawable() external view returns (uint256) {
        uint256 t = 0;
        for (uint256 i = 0; i < activeEmployees.length; i++) {
            if (!streams[activeEmployees[i]].paused) t += _withdrawable(activeEmployees[i]);
        }
        return t;
    }

    function getEmployerStats(address employer) external view returns (uint256, uint256, uint256, uint256) {
        address[] memory emps = employerToEmployees[employer];
        uint256 ec = emps.length;
        uint256 ac; uint256 tr; uint256 tp;
        for (uint256 i = 0; i < emps.length; i++) {
            Stream storage st = streams[emps[i]];
            if (st.exists) {
                if (hasActiveStream[emps[i]]) ac++;
                tr += st.totalAllocated - st.withdrawn;
                tp += st.withdrawn;
            }
        }
        return (ec, ac, tr, tp);
    }

    // =====================================================================
    //                        INTERNAL HELPERS
    // =====================================================================

    function _earned(address employee) internal view returns (uint256) {
        Stream storage s = streams[employee];
        uint256 eff = block.timestamp < s.endTime ? block.timestamp : s.endTime;
        return s.ratePerSecond * (eff - s.startTime);
    }

    function _withdrawable(address employee) internal view returns (uint256) {
        return _earned(employee) - streams[employee].withdrawn;
    }

    function _requireHRorCEO(uint256 companyId) internal view {
        Role r = companyRoles[companyId][msg.sender];
        require(r == Role.HR || r == Role.CEO, "Not HR or CEO");
    }

    function _countCEOs(uint256 companyId) internal view returns (uint256 c) {
        address[] storage m = _companyRoleMembers[companyId];
        for (uint256 i = 0; i < m.length; i++) {
            if (companyRoles[companyId][m[i]] == Role.CEO) c++;
        }
    }

    function _trackRoleMember(uint256 companyId, address account) internal {
        if (!_isRoleMemberTracked[companyId][account]) {
            _roleMemberIdx[companyId][account] = _companyRoleMembers[companyId].length;
            _companyRoleMembers[companyId].push(account);
            _isRoleMemberTracked[companyId][account] = true;
        }
    }

    function _untrackRoleMember(uint256 companyId, address account) internal {
        if (_isRoleMemberTracked[companyId][account]) {
            address[] storage m = _companyRoleMembers[companyId];
            uint256 idx = _roleMemberIdx[companyId][account];
            uint256 last = m.length - 1;
            if (idx != last) {
                address tail = m[last];
                m[idx] = tail;
                _roleMemberIdx[companyId][tail] = idx;
            }
            m.pop();
            delete _roleMemberIdx[companyId][account];
            _isRoleMemberTracked[companyId][account] = false;
        }
    }
}
