require("dotenv").config({ path: "./backend/.env" });
const { ethers } = require("ethers");
const addresses = require("../addresses.json");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.helachain.com", 666888);
    
    const account2 = "0x7bb5c0f2ecc1ac4f3a27ba4fd1c62a0cb6e660ea";
    const merchant = "0x73f48a8f04955D3266402f562caFB5127bfbEC37";
    const routerAddr = addresses.ROUTER;
    
    const husd = new ethers.Contract(addresses.HUSD, [
        "function balanceOf(address) view returns (uint256)",
        "function allowance(address,address) view returns (uint256)",
    ], provider);
    
    const router = new ethers.Contract(routerAddr, [
        "function getInvoice(bytes32) view returns (address,uint256,uint8,address,uint256,uint256)",
        "function getMerchantInvoiceCount(address) view returns (uint256)",
        "function getMerchantInvoiceAt(address,uint256) view returns (bytes32)",
    ], provider);

    console.log("=== HUSD Balances ===");
    const bal2 = await husd.balanceOf(account2);
    console.log(`Account 2 (${account2}): ${ethers.formatEther(bal2)} HUSD`);
    
    const balMerchant = await husd.balanceOf(merchant);
    console.log(`Merchant  (${merchant}): ${ethers.formatEther(balMerchant)} HUSD`);

    console.log("\n=== HUSD Allowance (Account2 -> Router) ===");
    const allowance = await husd.allowance(account2, routerAddr);
    console.log(`Allowance: ${ethers.formatEther(allowance)} HUSD`);

    console.log("\n=== Merchant Invoices ===");
    const count = await router.getMerchantInvoiceCount(merchant);
    console.log(`Total invoices: ${count}`);
    
    const statusMap = ["Active", "Paid", "Cancelled"];
    for (let i = 0; i < Number(count); i++) {
        const id = await router.getMerchantInvoiceAt(merchant, i);
        const inv = await router.getInvoice(id);
        console.log(`  Invoice ${i}: ${id}`);
        console.log(`    Amount: ${ethers.formatEther(inv[1])} HUSD | Status: ${statusMap[Number(inv[2])]} | Payer: ${inv[3]}`);
    }
}

main().catch(console.error);
