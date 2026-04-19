const { ethers } = require("ethers");
require("dotenv").config();

async function check() {
    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.helachain.com");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Backend Wallet Address:", wallet.address);

    const balance = await provider.getBalance(wallet.address);
    console.log("HLUSD Balance (Gas):", ethers.formatEther(balance));

    const husdAddr = process.env.HUSD_ADDRESS;
    const husdAbi = ["function balanceOf(address) view returns (uint256)", "function symbol() view returns (string)"];
    const husd = new ethers.Contract(husdAddr, husdAbi, provider);
    try {
        const husdBal = await husd.balanceOf(wallet.address);
        const symbol = await husd.symbol();
        console.log(`${symbol} Balance:`, ethers.formatEther(husdBal));
    } catch (e) {
        console.log("Could not fetch HUSD balance (check address/ABI)");
    }
    
    const routerAddr = process.env.ROUTER_ADDRESS;
    const routerAbi = ["function getMerchantInvoiceCount(address) view returns (uint256)"];
    const router = new ethers.Contract(routerAddr, routerAbi, provider);
    try {
        const count = await router.getMerchantInvoiceCount(wallet.address);
        console.log("Router check (getMerchantInvoiceCount):", count.toString());
    } catch (e) {
        console.log("Router check failed - is address correct?", routerAddr);
    }
}

check();
