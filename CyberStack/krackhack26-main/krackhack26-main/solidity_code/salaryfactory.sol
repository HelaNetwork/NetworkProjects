// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./salarystream.sol";

contract SalaryFactory {

    event StreamCreated(
        address indexed employer,
        address indexed employee,
        address streamAddress,
        uint256 monthlySalary
    );

    address[] public allStreams;

    mapping(address => address[]) public employerStreams;
    mapping(address => address[]) public employeeStreams;

    function createStream(
        address employee,
        address taxVault,
        uint256 monthlySalary,
        uint256 taxPercent
    )
        external
        payable
        returns (address)
    {
        SalaryStreaming newStream =
            (new SalaryStreaming){value: msg.value}(
                msg.sender,   // ✅ FIX — real employer wallet
                employee,
                taxVault,
                monthlySalary,
                taxPercent
            );

        address streamAddress = address(newStream);

        allStreams.push(streamAddress);
        employerStreams[msg.sender].push(streamAddress);
        employeeStreams[employee].push(streamAddress);

        emit StreamCreated(
            msg.sender,
            employee,
            streamAddress,
            monthlySalary
        );

        return streamAddress;
    }

    function getAllStreams()
        external
        view
        returns (address[] memory)
    {
        return allStreams;
    }

    function getEmployerStreams(address employer)
        external
        view
        returns (address[] memory)
    {
        return employerStreams[employer];
    }

    function getEmployeeStreams(address employee)
        external
        view
        returns (address[] memory)
    {
        return employeeStreams[employee];
    }
}
    