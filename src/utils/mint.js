// scripts/mint.js
const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("<YOUR_RPC_URL>");
const wallet = new ethers.Wallet("<YOUR_PRIVATE_KEY>", provider);

const contractAddress = "<DEPLOYED_CONTRACT_ADDRESS>";
const abi = [
  "function createNFT(address to, string memory tokenURI) public returns (uint256)"
];

const myNFT = new ethers.Contract(contractAddress, abi, wallet);

async function mintNFT() {
  const recipient = "<RECIPIENT_ADDRESS>";
  const tokenURI = "<TOKEN_URI>"; // e.g., 'https://myapi.com/api/nft/1'

  try {
    const tx = await myNFT.createNFT(recipient, tokenURI);
    console.log("Transaction hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.transactionHash);
  } catch (error) {
    console.error("Error minting NFT:", error);
  }
}

mintNFT();
