// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    mapping(address => uint256[]) private _ownedTokens;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender){
        tokenCounter = 0;
    }

    function createNFT(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 newItemId = tokenCounter;
        _mint(to, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _ownedTokens[to].push(newItemId); 
        tokenCounter++;
        return newItemId;
    }

    function getNFTsByOwner(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }
}
