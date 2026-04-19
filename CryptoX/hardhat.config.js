require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: "0.8.9",
  networks: {
    hela: {
      url: "https://testnet-rpc.helachain.com",
      chainId: 666888,
      accounts: ["e36bc421b1a971f969c22313ef94031b275412c0cee9dc8d099d1a0f19f74166"],
    },
  },
};
