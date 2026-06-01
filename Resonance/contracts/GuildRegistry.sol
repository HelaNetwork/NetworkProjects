// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract GuildRegistry is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    enum Role { FAN, ARTIST, CURATOR, ADMIN }

    struct Guild {
        string name;
        string description;
        address treasury;
        address[] admins;
        bool isPublic;
        uint256 createdAt;
    }

    mapping(uint256 => Guild) private _guilds;
    mapping(uint256 => mapping(address => Role)) private _memberRoles;
    mapping(uint256 => EnumerableSet.AddressSet) private _members;
    mapping(uint256 => mapping(Role => EnumerableSet.AddressSet)) private _membersByRole;
    
    uint256 private _nextGuildId;

    event GuildCreated(uint256 indexed guildId, string name, address indexed creator);
    event MemberJoined(uint256 indexed guildId, address indexed member, Role role);
    event RoleAssigned(uint256 indexed guildId, address indexed member, Role role);
    event TreasurySet(uint256 indexed guildId, address treasury);

    function createGuild(
        string memory name,
        string memory description,
        address[] memory initialAdmins,
        bool isPublic
    ) external returns (uint256) {
        uint256 guildId = _nextGuildId++;
        
        _guilds[guildId] = Guild({
            name: name,
            description: description,
            treasury: address(0),
            admins: initialAdmins,
            isPublic: isPublic,
            createdAt: block.timestamp
        });
        
        // Add creator as admin
        _members[guildId].add(msg.sender);
        _membersByRole[guildId][Role.ADMIN].add(msg.sender);
        _memberRoles[guildId][msg.sender] = Role.ADMIN;
        
        // Add initial admins
        for (uint256 i = 0; i < initialAdmins.length; i++) {
            if (initialAdmins[i] != msg.sender) {
                _members[guildId].add(initialAdmins[i]);
                _membersByRole[guildId][Role.ADMIN].add(initialAdmins[i]);
                _memberRoles[guildId][initialAdmins[i]] = Role.ADMIN;
            }
        }
        
        emit GuildCreated(guildId, name, msg.sender);
        return guildId;
    }

    function joinGuild(uint256 guildId) external {
        Guild storage guild = _guilds[guildId];
        require(guild.createdAt > 0, "Guild does not exist");
        require(guild.isPublic, "Guild is private");
        require(!_members[guildId].contains(msg.sender), "Already a member");
        
        _members[guildId].add(msg.sender);
        _membersByRole[guildId][Role.FAN].add(msg.sender);
        _memberRoles[guildId][msg.sender] = Role.FAN;
        
        emit MemberJoined(guildId, msg.sender, Role.FAN);
    }

    function assignRole(uint256 guildId, address member, Role role) external {
        require(_guilds[guildId].createdAt > 0, "Guild does not exist");
        require(_members[guildId].contains(msg.sender), "Not a guild member");
        require(
            _memberRoles[guildId][msg.sender] == Role.ADMIN || 
            owner() == msg.sender,
            "Not authorized"
        );
        require(_members[guildId].contains(member), "Member not in guild");
        
        // Remove from old role set
        Role oldRole = _memberRoles[guildId][member];
        _membersByRole[guildId][oldRole].remove(member);
        
        // Add to new role set
        _memberRoles[guildId][member] = role;
        _membersByRole[guildId][role].add(member);
        
        emit RoleAssigned(guildId, member, role);
    }

    function setTreasury(uint256 guildId, address treasury) external {
        require(_guilds[guildId].createdAt > 0, "Guild does not exist");
        require(
            _memberRoles[guildId][msg.sender] == Role.ADMIN || 
            owner() == msg.sender,
            "Not authorized"
        );
        
        _guilds[guildId].treasury = treasury;
        emit TreasurySet(guildId, treasury);
    }

    function getGuild(uint256 guildId) 
        external 
        view 
        returns (
            string memory name,
            string memory description,
            address treasury,
            address[] memory admins,
            bool isPublic,
            uint256 createdAt
        ) 
    {
        Guild memory g = _guilds[guildId];
        return (g.name, g.description, g.treasury, g.admins, g.isPublic, g.createdAt);
    }

    function getMembers(uint256 guildId) external view returns (address[] memory) {
        return _members[guildId].values();
    }

    function getMembersByRole(uint256 guildId, Role role) external view returns (address[] memory) {
        return _membersByRole[guildId][role].values();
    }

    function getRole(uint256 guildId, address member) external view returns (Role) {
        return _memberRoles[guildId][member];
    }

    function isMember(uint256 guildId, address member) external view returns (bool) {
        return _members[guildId].contains(member);
    }

    function totalGuilds() external view returns (uint256) {
        return _nextGuildId;
    }
}
