// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract EventTicket is ERC721A, Ownable, ERC2981 {
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_PER_WALLET = 4;
    uint256 public ticketPrice = 0.01 ether;

    mapping(address => uint256) public mintedPerWallet;

    constructor() ERC721A("HelaEventTicket", "HELA") {
        _setDefaultRoyalty(msg.sender, 500); // 5% royalty
    }

    function mint(uint256 quantity) external payable {
        require(totalSupply() + quantity <= MAX_SUPPLY, "Max supply reached");
        require(mintedPerWallet[msg.sender] + quantity <= MAX_PER_WALLET, "Max per wallet reached");
        require(msg.value >= ticketPrice * quantity, "Insufficient funds");

        mintedPerWallet[msg.sender] += quantity;
        _mint(msg.sender, quantity);
    }

    function setTicketPrice(uint256 _price) external onlyOwner {
        ticketPrice = _price;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721A, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
