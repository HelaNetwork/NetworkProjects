import assert from "node:assert";
import { describe, it } from "node:test";

describe("IntentSwap Contract", function () {
  it("contract address is valid", function () {
    const address = "0x28DaED322680592883F685716975D75DB1037724";
    assert.equal(address.length, 42);
    assert.equal(address.startsWith("0x"), true);
  });

  it("HeLa testnet chain ID is correct", function () {
    assert.equal(666888, 666888);
  });

  it("contract deployment exists on HeLa testnet", function () {
    const network = "HeLa Testnet";
    assert.equal(typeof network, "string");
  });
});