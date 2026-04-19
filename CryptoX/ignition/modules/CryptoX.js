const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CryptoX", (m) => {
  const cryptoX = m.contract("CryptoX");
  return { cryptoX };
});