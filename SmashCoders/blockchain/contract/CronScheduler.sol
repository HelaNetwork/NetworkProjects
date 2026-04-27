// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CronScheduler
 * @dev Onchain scheduling of transactions. 
 * Allows users to schedule a transaction to be executed at a specific time or interval.
 * Keepers/relayers watch this contract and call `executeTask(taskId)` when the time is ripe.
 */
contract CronScheduler {
    struct Task {
        address owner;
        address target;
        bytes callData;
        uint256 nextExecutionTime;
        uint256 interval;
        bool isActive;
    }

    uint256 public nextTaskId;
    mapping(uint256 => Task) public tasks;

    event TaskCreated(uint256 indexed taskId, address indexed owner, address target, uint256 nextExecutionTime, uint256 interval);
    event TaskExecuted(uint256 indexed taskId, bool success, bytes returnData);
    event TaskCancelled(uint256 indexed taskId);

    /**
     * @dev Schedule a new task.
     * @param _target The address of the contract to call.
     * @param _callData The calldata to send to the target contract.
     * @param _nextExecutionTime The Unix timestamp for the next execution.
     * @param _interval The interval in seconds if it's a recurring task (0 for one-time).
     */
    function scheduleTask(
        address _target,
        bytes calldata _callData,
        uint256 _nextExecutionTime,
        uint256 _interval
    ) external returns (uint256 taskId) {
        require(_nextExecutionTime >= block.timestamp, "Execution time must be in future");

        taskId = nextTaskId++;
        
        tasks[taskId] = Task({
            owner: msg.sender,
            target: _target,
            callData: _callData,
            nextExecutionTime: _nextExecutionTime,
            interval: _interval,
            isActive: true
        });

        emit TaskCreated(taskId, msg.sender, _target, _nextExecutionTime, _interval);
        return taskId;
    }

    /**
     * @dev Cancel a scheduled task. Only the owner can cancel it.
     * @param _taskId The ID of the task to cancel.
     */
    function cancelTask(uint256 _taskId) external {
        require(tasks[_taskId].owner == msg.sender, "Not task owner");
        require(tasks[_taskId].isActive, "Task already inactive");

        tasks[_taskId].isActive = false;
        emit TaskCancelled(_taskId);
    }

    /**
     * @dev Execute a pending task. Any keeper or relayer can call this.
     * @param _taskId The ID of the task to execute.
     */
    function executeTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        
        require(task.isActive, "Task is not active");
        require(block.timestamp >= task.nextExecutionTime, "Too early to execute");

        // Mark as inactive if it's a one-time task
        if (task.interval == 0) {
            task.isActive = false;
        } else {
            // Update next execution time for recurring task
            task.nextExecutionTime += task.interval;
        }

        // Execution
        (bool success, bytes memory returnData) = task.target.call(task.callData);
        
        emit TaskExecuted(_taskId, success, returnData);
    }

    /**
     * @dev Helper to query multiple tasks (useful for keepers).
     */
    function getTask(uint256 _taskId) external view returns (Task memory) {
        return tasks[_taskId];
    }
}
