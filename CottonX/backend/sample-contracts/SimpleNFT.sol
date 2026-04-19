// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleNFT
 * @dev A basic NFT contract for testing custom contract deployment
 */
contract SimpleNFT {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    /**
     * @dev Constructor to initialize the NFT collection
     * @param _name Collection name
     * @param _symbol Collection symbol
     */
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }
    
    /**
     * @dev Mint a new NFT
     * @param _to The address that will own the minted NFT
     * @param _tokenId The token ID to mint
     */
    function mint(address _to, uint256 _tokenId) public {
        require(_to != address(0), "Cannot mint to zero address");
        require(ownerOf[_tokenId] == address(0), "Token already minted");
        
        balanceOf[_to]++;
        ownerOf[_tokenId] = _to;
        totalSupply++;
        
        emit Transfer(address(0), _to, _tokenId);
    }
    
    /**
     * @dev Transfer NFT to a specified address
     * @param _from Current owner of the NFT
     * @param _to Address to receive the NFT
     * @param _tokenId Token ID to transfer
     */
    function transferFrom(address _from, address _to, uint256 _tokenId) public {
        require(_to != address(0), "Cannot transfer to zero address");
        require(ownerOf[_tokenId] == _from, "From address is not the owner");
        require(
            msg.sender == _from || 
            msg.sender == getApproved[_tokenId] || 
            isApprovedForAll[_from][msg.sender],
            "Not authorized to transfer"
        );
        
        balanceOf[_from]--;
        balanceOf[_to]++;
        ownerOf[_tokenId] = _to;
        delete getApproved[_tokenId];
        
        emit Transfer(_from, _to, _tokenId);
    }
    
    /**
     * @dev Approve another address to transfer the given token ID
     * @param _approved Address to be approved
     * @param _tokenId Token ID to approve
     */
    function approve(address _approved, uint256 _tokenId) public {
        address owner = ownerOf[_tokenId];
        require(msg.sender == owner || isApprovedForAll[owner][msg.sender], "Not authorized");
        
        getApproved[_tokenId] = _approved;
        emit Approval(owner, _approved, _tokenId);
    }
    
    /**
     * @dev Enable or disable approval for a third party to manage all of msg.sender's assets
     * @param _operator Address to add to the set of authorized operators
     * @param _approved True if the operator is approved, false to revoke approval
     */
    function setApprovalForAll(address _operator, bool _approved) public {
        isApprovedForAll[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }
}
