import 'dotenv/config';
import { ethers } from 'ethers';
import { logConsole } from '../../../utils';
// Uniswap V2 Pair ABI (minimal required functions)
const UNISWAP_V2_PAIR_ABI = [
    {
        "inputs": [],
        "name": "getReserves",
        "outputs": [
            { "internalType": "uint112", "name": "reserve0", "type": "uint112" },
            { "internalType": "uint112", "name": "reserve1", "type": "uint112" },
            { "internalType": "uint32", "name": "blockTimestampLast", "type": "uint32" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "token0",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "token1",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    }
];

// ERC20 Interface for token decimals
const ERC20_ABI = [
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    }
];

interface PriceData {
    timestamp: number;
    price: number;
    reserve0: string;
    reserve1: string;
}

interface TokenPriceInfo {
    currentPrice: number;
    priceHistory: PriceData[];
    token0Address: string;
    token1Address: string;
    pairAddress: string;
    token0Decimals: number;
    token1Decimals: number;
}

export async function getUniswapPriceData(
    pairAddress: string,
    timeframe: number = 300, // 5 minutes in seconds
    dataPoints: number = 12  // Number of data points to return
): Promise<TokenPriceInfo | null> {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const pairContract = new ethers.Contract(pairAddress, UNISWAP_V2_PAIR_ABI, provider);

        // Get token addresses
        const token0Address = await pairContract.token0();
        const token1Address = await pairContract.token1();

        // Get token contracts
        const token0Contract = new ethers.Contract(token0Address, ERC20_ABI, provider);
        const token1Contract = new ethers.Contract(token1Address, ERC20_ABI, provider);

        // Get decimals
        const token0Decimals = await token0Contract.decimals();
        const token1Decimals = await token1Contract.decimals();

        // Get current block
        const currentBlock = await provider.getBlockNumber();
        const priceHistory: PriceData[] = [];

        // Calculate blocks to go back based on average block time (assuming ~12 second blocks)
        const blocksPerTimeframe = Math.floor(timeframe / 12);
        const totalBlocksToFetch = blocksPerTimeframe * dataPoints;

        // Fetch historical data
        for (let i = 0; i < dataPoints; i++) {
            const targetBlock = currentBlock - (totalBlocksToFetch - (i * blocksPerTimeframe));
            const blockData = await provider.getBlock(targetBlock);

            if (!blockData) continue;

            // Get reserves at this block
            const reserves = await pairContract.getReserves({ blockTag: targetBlock });

            const reserve0 = reserves[0];
            const reserve1 = reserves[1];

            // Calculate price (token1 per token0)
            const price = calculatePrice(
                reserve0.toString(),
                reserve1.toString(),
                token0Decimals,
                token1Decimals
            );

            priceHistory.push({
                timestamp: blockData.timestamp,
                price: price,
                reserve0: reserve0.toString(),
                reserve1: reserve1.toString()
            });
        }

        // Get current reserves
        const currentReserves = await pairContract.getReserves();
        const currentPrice = calculatePrice(
            currentReserves[0].toString(),
            currentReserves[1].toString(),
            token0Decimals,
            token1Decimals
        );

        return {
            currentPrice,
            priceHistory,
            token0Address,
            token1Address,
            pairAddress,
            token0Decimals,
            token1Decimals
        };

    } catch (error: any) {
        logConsole.info(`Error fetching Uniswap price data: ${error.message}`);
        return null;
    }
}

function calculatePrice(
    reserve0: string,
    reserve1: string,
    decimals0: number,
    decimals1: number
): number {
    const reserve0Big = BigInt(reserve0);
    const reserve1Big = BigInt(reserve1);
    const decimal0Adj = BigInt(10) ** BigInt(decimals0);
    const decimal1Adj = BigInt(10) ** BigInt(decimals1);

    // Flip the calculation to get token price in ETH
    const reserve0Adjusted = Number(reserve0Big);
    const reserve1Adjusted = Number(reserve1Big * decimal0Adj) / Number(decimal1Adj);

    return reserve0Adjusted / reserve1Adjusted;
}

export async function getPriceAnalytics(pairAddress: string): Promise<any> {
    const priceData = await getUniswapPriceData(pairAddress);

    if (!priceData) {
        return { error: "Failed to fetch price data" };
    }

    const prices = priceData.priceHistory.map(d => d.price);
    const timestamps = priceData.priceHistory.map(d => d.timestamp);

    // Calculate analytics
    const recentHigh = Math.max(...prices);
    const recentLow = Math.min(...prices);
    const volatility = ((recentHigh - recentLow) / recentLow) * 100;

    const priceChange = prices[prices.length - 1] - prices[0];
    const priceChangePercent = (priceChange / prices[0]) * 100;

    // Calculate volume-like metric using reserve changes
    const reserveChanges = priceData.priceHistory.map((d, i, arr) => {
        if (i === 0) return 0;
        const prevReserve0 = BigInt(arr[i - 1].reserve0);
        const currentReserve0 = BigInt(d.reserve0);
        return Math.abs(Number(currentReserve0 - prevReserve0));
    });

    const averageReserveChange = reserveChanges.reduce((a, b) => a + b, 0) / reserveChanges.length;

    // Calculate Fibonacci levels
    const fibLevels = {
        level_23_6: recentLow + (recentHigh - recentLow) * 0.236,
        level_38_2: recentLow + (recentHigh - recentLow) * 0.382,
        level_50: recentLow + (recentHigh - recentLow) * 0.5,
        level_61_8: recentLow + (recentHigh - recentLow) * 0.618,
        level_100: recentHigh
    };

    return {
        currentPrice: priceData.currentPrice,
        priceHistory: priceData.priceHistory,
        analytics: {
            recentHigh,
            recentLow,
            volatility,
            priceChange,
            priceChangePercent,
            averageReserveChange,
            fibonacciLevels: fibLevels,
            overallTrend: priceChange > 0 ? "Upward" : "Downward",
            liquidityTrend: averageReserveChange > 0 ? "Increasing" : "Decreasing"
        },
        pairInfo: {
            token0: priceData.token0Address,
            token1: priceData.token1Address,
            pairAddress: priceData.pairAddress
        }
    };
}

async function getEthPrice(): Promise<number> {
    // USDC/WETH pair on Base
    const USDC_WETH_PAIR = '0x88A43bbDF9D098eEC7bCEda4e2494615dfD9bB9C';

    try {
        const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const pairContract = new ethers.Contract(USDC_WETH_PAIR, UNISWAP_V2_PAIR_ABI, provider);

        // Get current reserves
        const reserves = await pairContract.getReserves();

        // Get token addresses to determine order
        const token0 = await pairContract.token0();
        const token1 = await pairContract.token1();

        // USDC contract for decimals
        const usdcContract = new ethers.Contract(
            process.env.USDC_ADDRESS as string,
            ERC20_ABI,
            provider
        );
        const usdcDecimals = await usdcContract.decimals();

        // WETH contract for decimals
        const wethContract = new ethers.Contract(
            process.env.WETH_ADDRESS as string,
            ERC20_ABI,
            provider
        );
        const wethDecimals = await wethContract.decimals();

        // Calculate price based on token order
        const isUsdcToken0 = token0.toLowerCase() === process.env.USDC_ADDRESS?.toLowerCase();

        // Convert reserves to BigInt
        const reserve0 = BigInt(reserves[0].toString());
        const reserve1 = BigInt(reserves[1].toString());

        // Calculate decimal adjustments using BigInt
        const usdcAdjustment = BigInt(10) ** BigInt(usdcDecimals);
        const wethAdjustment = BigInt(10) ** BigInt(wethDecimals);

        if (isUsdcToken0) {
            // USDC is token0
            const usdcAmount = Number(reserve0.toString()) / Number(usdcAdjustment.toString());
            const ethAmount = Number(reserve1.toString()) / Number(wethAdjustment.toString());
            return usdcAmount / ethAmount;
        } else {
            // USDC is token1
            const ethAmount = Number(reserve0.toString()) / Number(wethAdjustment.toString());
            const usdcAmount = Number(reserve1.toString()) / Number(usdcAdjustment.toString());
            return usdcAmount / ethAmount;
        }
    } catch (error) {
        console.error('Error fetching ETH price:', error);
        throw error;
    }
}

// async function testLocalPriceData() {
//     const testPairs = {
//         'TOSHI-WETH': '0xb4885bc63399bf5518b994c1d0c153334ee579d0'
//     };

//     try {
//         logConsole.info('🚀 Starting local price data test...\n');

//         // First get ETH price in USD
//         logConsole.info('Fetching current ETH price...');
//         const ethPrice = await getEthPrice();
//         logConsole.info(`Current ETH price: $${ethPrice.toFixed(2)}`);

//         for (const [pairName, pairAddress] of Object.entries(testPairs)) {
//             logConsole.info(`\n📊 Testing ${pairName} pair (${pairAddress})`);

//             // Get basic price data with 15 data points
//             logConsole.info('\nFetching basic price data...');
//             const priceData = await getUniswapPriceData(pairAddress, 300, 15);
//             if (priceData) {
//                 logConsole.info('Current TOSHI Price (in ETH):', priceData.currentPrice.toFixed(8));
//                 logConsole.info('Current TOSHI Price (in USD):', (priceData.currentPrice * ethPrice).toFixed(4));
//                 logConsole.info('Token0 (TOSHI) Address:', priceData.token0Address);
//                 logConsole.info('Token1 (WETH) Address:', priceData.token1Address);
//                 logConsole.info('\nLast 15 historical prices:');
//                 priceData.priceHistory.forEach(history => {
//                     logConsole.info({
//                         timestamp: new Date(history.timestamp * 1000).toISOString(),
//                         priceInETH: history.price.toFixed(8),
//                         priceInUSD: (history.price * ethPrice).toFixed(4)
//                     });
//                 });
//             }

//             // Get detailed analytics
//             logConsole.info('\nFetching detailed analytics...');
//             const analytics = await getPriceAnalytics(pairAddress);
//             if (analytics && !analytics.error) {
//                 logConsole.info('Analytics:', {
//                     currentPrice: `${analytics.currentPrice.toFixed(8)} ETH ($${(analytics.currentPrice * ethPrice).toFixed(4)})`,
//                     recentHigh: `${analytics.analytics.recentHigh.toFixed(8)} ETH ($${(analytics.analytics.recentHigh * ethPrice).toFixed(4)})`,
//                     recentLow: `${analytics.analytics.recentLow.toFixed(8)} ETH ($${(analytics.analytics.recentLow * ethPrice).toFixed(4)})`,
//                     volatility: `${analytics.analytics.volatility.toFixed(2)}%`,
//                     priceChangePercent: `${analytics.analytics.priceChangePercent.toFixed(2)}%`,
//                     overallTrend: analytics.analytics.overallTrend
//                 });
//             }

//             logConsole.info('\n' + '='.repeat(50) + '\n');
//         }

//     } catch (error) {
//         console.error('❌ Test failed:', error);
//     }
// }

// Uncomment to run the test
// testLocalPriceData();
