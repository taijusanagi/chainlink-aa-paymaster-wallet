// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NFTDrop is ERC721Enumerable {
  constructor() ERC721("NFTDrop", "NFTD") {}

  function mint() public {
    uint256 tokenId = totalSupply();
    _mint(msg.sender, tokenId);
  }

  function tokenURI(uint256) public pure override returns (string memory) {
    return "https://raw.githubusercontent.com/taijusanagi/capsule-wallet/main/data/metadata.json";
  }
}
