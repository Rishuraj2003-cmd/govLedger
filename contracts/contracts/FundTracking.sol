// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FundTracking is Ownable {
    enum Role {
        NONE,
        ADMIN,
        DISTRICT,
        DEPARTMENT,
        CONTRACTOR,
        VENDOR
    }

    struct Project {
        uint256 id;
        string name;
        uint256 budget;
        uint256 allocatedFunds;
        uint256 utilizedFunds;
        string department;
        string district;
        string timeline;
        address admin;
        address districtOfficer;
        address departmentHead;
        bool exists;
    }

    struct TransactionRecord {
        uint256 id;
        uint256 projectId;
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
        string stage;
        string note;
    }

    uint256 public nextProjectId = 1;
    uint256 public nextTransactionId = 1;

    mapping(address => Role) public roles;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => TransactionRecord[]) private transactionHistory;

    event ProjectCreated(
        uint256 indexed projectId,
        string name,
        uint256 budget,
        string department,
        string district,
        uint256 timestamp
    );

    event FundsAllocated(
        uint256 indexed projectId,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp,
        string note
    );

    event FundsTransferred(
        uint256 indexed projectId,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp,
        string note
    );

    constructor() Ownable(msg.sender) {
        roles[msg.sender] = Role.ADMIN;
    }

    modifier onlyRole(Role expectedRole) {
        require(roles[msg.sender] == expectedRole, "Unauthorized role");
        _;
    }

    modifier validProject(uint256 projectId) {
        require(projects[projectId].exists, "Project does not exist");
        _;
    }

    function assignRole(address account, Role role) external onlyOwner {
        roles[account] = role;
    }

    function createProject(
        string memory name,
        uint256 budget,
        string memory department,
        string memory district,
        string memory timeline,
        address districtOfficer,
        address departmentHead
    ) external onlyRole(Role.ADMIN) returns (uint256) {
        uint256 projectId = nextProjectId++;
        projects[projectId] = Project({
            id: projectId,
            name: name,
            budget: budget,
            allocatedFunds: 0,
            utilizedFunds: 0,
            department: department,
            district: district,
            timeline: timeline,
            admin: msg.sender,
            districtOfficer: districtOfficer,
            departmentHead: departmentHead,
            exists: true
        });

        if (districtOfficer != address(0)) {
            roles[districtOfficer] = Role.DISTRICT;
        }
        if (departmentHead != address(0)) {
            roles[departmentHead] = Role.DEPARTMENT;
        }

        emit ProjectCreated(projectId, name, budget, department, district, block.timestamp);
        return projectId;
    }

    function allocateFunds(
        uint256 projectId,
        address receiver,
        uint256 amount,
        string memory note
    ) external onlyRole(Role.ADMIN) validProject(projectId) {
        Project storage project = projects[projectId];
        require(project.allocatedFunds + amount <= project.budget, "Budget exceeded");

        project.allocatedFunds += amount;
        _recordTransaction(projectId, msg.sender, receiver, amount, "State to District", note, true);
    }

    function transferFunds(
        uint256 projectId,
        address receiver,
        uint256 amount,
        string memory note
    ) external validProject(projectId) {
        Project storage project = projects[projectId];
        Role senderRole = roles[msg.sender];
        require(
            senderRole == Role.DISTRICT || senderRole == Role.DEPARTMENT,
            "Only district or department can transfer"
        );
        require(project.allocatedFunds >= project.utilizedFunds + amount, "Insufficient allocated funds");

        string memory stage = senderRole == Role.DISTRICT ? "District to Department" : "Department to Contractor";

        if (senderRole == Role.DEPARTMENT) {
            project.utilizedFunds += amount;
            if (roles[receiver] == Role.NONE) {
                roles[receiver] = Role.CONTRACTOR;
            }
        }

        _recordTransaction(projectId, msg.sender, receiver, amount, stage, note, false);
    }

    function getProjectDetails(uint256 projectId) external view validProject(projectId) returns (Project memory) {
        return projects[projectId];
    }

    function getTransactionHistory(
        uint256 projectId
    ) external view validProject(projectId) returns (TransactionRecord[] memory) {
        return transactionHistory[projectId];
    }

    function _recordTransaction(
        uint256 projectId,
        address sender,
        address receiver,
        uint256 amount,
        string memory stage,
        string memory note,
        bool isAllocation
    ) internal {
        TransactionRecord memory entry = TransactionRecord({
            id: nextTransactionId++,
            projectId: projectId,
            sender: sender,
            receiver: receiver,
            amount: amount,
            timestamp: block.timestamp,
            stage: stage,
            note: note
        });

        transactionHistory[projectId].push(entry);

        if (isAllocation) {
            emit FundsAllocated(projectId, sender, receiver, amount, block.timestamp, note);
        } else {
            emit FundsTransferred(projectId, sender, receiver, amount, block.timestamp, note);
        }
    }
}
