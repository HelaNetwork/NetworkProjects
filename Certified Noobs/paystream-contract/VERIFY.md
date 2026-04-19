# Contract verification on HeLa testnet

**“Not verified” does not mean “no owner”.** The contract has an owner (the deployer) set at deployment. Verification only publishes the source code on the block explorer so anyone can read it.

---

## Constructor arguments (required for verification)

`NativePayStream` was deployed with:

- `_taxVault` (address) – e.g. `0x0000000000000000000000000000000000000000` if you did not set `TAX_VAULT_ADDRESS`
- `_taxBps` (uint256) – e.g. `0` if no tax vault, or `1000` for 10% if you set a vault

You must use the **exact same** values you used when you deployed the contract at `0x5d77e...`, or verification will fail.

---

## Method 1: Hardhat (recommended)

Uses the Hardhat Verify plugin and the explorer’s API. Easiest if your explorer is Etherscan-compatible.

### 1. Install the plugin (if not already)

```bash
cd paystream-contract
npm install --save-dev @nomicfoundation/hardhat-verify
```

(Your `hardhat.config.js` already `require`s it.)

### 2. Get an API key (if the explorer requires one)

- Open the HeLa testnet block explorer (e.g. https://testnet-blockexplorer.helachain.com or the URL in your config).
- Log in, find “API keys” or “Verify contract”, create a key.
- In `paystream-contract/.env` add:
  ```env
  HELA_EXPLORER_API_KEY=your_api_key_here
  ```
- In `hardhat.config.js`, under `etherscan.apiKey`, set:
  ```js
  hela: process.env.HELA_EXPLORER_API_KEY || "abc",
  ```
  (If the explorer does not use an API key, the placeholder is fine.)

### 3. Run the verify script

Use the **same** constructor args you used when you deployed (e.g. no tax vault):

```bash
CONTRACT=0x5d77e2B668725C927B7B16D9667EeB101B923Dd5 TAX_VAULT=0x0000000000000000000000000000000000000000 TAX_BPS=0 npx hardhat run scripts/verify-native.js --network hela
```

If you had set a tax vault when deploying, for example:

```bash
CONTRACT=0x5d77e2B668725C927B7B16D9667EeB101B923Dd5 TAX_VAULT=0xYourTaxVaultAddress TAX_BPS=1000 npx hardhat run scripts/verify-native.js --network hela
```

### 4. Or verify with inline args (without the script)

```bash
npx hardhat verify --network hela 0x5d77e2B668725C927B7B16D9667EeB101B923Dd5 "0x0000000000000000000000000000000000000000" "0"
```

(Replace the address and the two constructor args if you used different values.)

---

## Method 2: Solidity single file (manual on explorer)

Use this when the explorer has a “Verify contract” form and you paste source code.

### 1. Flatten the contract into one file

From `paystream-contract`:

```bash
npx hardhat flatten contracts/NativePayStream.sol > NativePayStream_flat.sol
```

Then open `NativePayStream_flat.sol` and:

- Keep a single `// SPDX-License-Identifier: MIT` at the top and remove duplicate SPDX and duplicate `pragma` lines in the middle.
- Save the file.

### 2. Open the block explorer

- Go to the contract’s page:  
  `https://testnet-blockexplorer.helachain.com/address/0x5d77e2B668725C927B7B16D9667EeB101B923Dd5`
- Click “Verify contract” / “Verify and publish”.

### 3. Fill the form

- **License:** MIT
- **Compiler:** 0.8.20 (match your `hardhat.config.js`)
- **Optimization:** Yes, 200 runs (match your config)
- **Verification method:** “Solidity (Single file)” or “Flattened source”
- **Contract code:** Paste the contents of `NativePayStream_flat.sol`.
- **Contract name:** `contracts/NativePayStream.sol:NativePayStream` (or whatever the explorer expects; sometimes just `NativePayStream`).
- **Constructor arguments (ABI-encoded):**  
  For `(address _taxVault, uint256 _taxBps)` with zero address and 0:
  - You can use the explorer’s “Constructor arguments” helper and enter:
    - `_taxVault`: `0x0000000000000000000000000000000000000000`
    - `_taxBps`: `0`
  - Or encode by hand:  
    - 32-byte address (left-padded):  
      `0000000000000000000000000000000000000000000000000000000000000000` (for zero address)  
    - 32-byte uint256 for 0:  
      `0000000000000000000000000000000000000000000000000000000000000000`  
    So concatenated:  
    `00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`

### 4. Submit

Submit the form. If compiler version, optimization, and constructor args match the deployment, the contract will be verified.

---

## If verification fails

- **Constructor arguments don’t match:** The bytecode will differ. Re-check how you deployed (e.g. from `deploy-native.js`: no env → taxVault = zero address, taxBps = 0; with `TAX_VAULT_ADDRESS` and `TAX_BPS` → use those).
- **Compiler / optimization:** Use exactly Solidity 0.8.20 and “200 runs” as in your `hardhat.config.js`.
- **API / network:** If using Hardhat, confirm the explorer URL and API key in `hardhat.config.js` match the HeLa testnet docs.

---

## Summary

| Method              | When to use                          |
|---------------------|--------------------------------------|
| **Hardhat**         | Automated; use if the explorer has an API. |
| **Solidity single file** | Explorer only has a “paste source” verify form. |

License **MIT** is correct. Use the **exact** constructor arguments you used when you deployed `0x5d77e2B668725C927B7B16D9667EeB101B923Dd5` (likely `0x0` and `0` if you didn’t set a tax vault).
