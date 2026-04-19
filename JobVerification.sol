// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract JobVerification {
    struct JobRecord {
        address applicant;
        string company;
        string role;
        uint256 timestamp;
        bool verified;
    }

    mapping(uint256 => JobRecord) public jobs;
    uint256 public jobCount;

    event JobAdded(uint256 indexed jobId, address indexed applicant, string company, string role);
    event JobVerified(uint256 indexed jobId);

    function addJob(string memory _company, string memory _role) public returns (uint256) {
        jobCount++;
        jobs[jobCount] = JobRecord({
            applicant: msg.sender,
            company: _company,
            role: _role,
            timestamp: block.timestamp,
            verified: false
        });
        emit JobAdded(jobCount, msg.sender, _company, _role);
        return jobCount;
    }

    function verifyJob(uint256 _jobId) public {
        require(_jobId <= jobCount, "Job does not exist");
        jobs[_jobId].verified = true;
        emit JobVerified(_jobId);
    }

    function getJob(uint256 _jobId) public view returns (JobRecord memory) {
        return jobs[_jobId];
    }
}
