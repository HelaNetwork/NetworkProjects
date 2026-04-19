import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl, } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../prisma.config.js';
const tradingRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'hello world';
const DEFAULT_PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS ?? 200);
const USDC_MINT_ADDRESS = process.env.USDC_MINT_ADDRESS ?? '';
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const DEFAULT_ESCROW_PROGRAM_ID = '11111111111111111111111111111111';
const ESCROW_PROGRAM_ID_RAW = process.env.ESCROW_PROGRAM_ID ?? DEFAULT_ESCROW_PROGRAM_ID;
const ESCROW_PROGRAM_ID = new PublicKey(ESCROW_PROGRAM_ID_RAW);
function getSolanaConnection() {
    const rpcUrl = process.env.SOLANA_RPC_URL ?? clusterApiUrl('devnet');
    return new Connection(rpcUrl, 'confirmed');
}
function getUserIdFromAuthHeader(authHeader) {
    if (!authHeader?.startsWith('Bearer '))
        return null;
    const token = authHeader.split(' ')[1];
    if (!token)
        return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === 'string')
            return null;
        return typeof decoded.userId === 'string' ? decoded.userId : null;
    }
    catch {
        return null;
    }
}
async function getUserWalletFromAuthHeader(authHeader) {
    const userId = getUserIdFromAuthHeader(authHeader);
    if (!userId)
        return null;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletAddress: true },
    });
    return user?.walletAddress ?? null;
}
function parsePositiveInt(value) {
    const parsed = typeof value === 'string' ? Number(value) : value;
    if (typeof parsed !== 'number' || !Number.isFinite(parsed))
        return null;
    const integer = Math.trunc(parsed);
    if (integer <= 0)
        return null;
    return integer;
}
function parseWalletAddress(value) {
    if (typeof value !== 'string' || !value.trim())
        return null;
    const wallet = value.trim();
    try {
        // Validate that it is a real Solana address.
        void new PublicKey(wallet);
        return wallet;
    }
    catch {
        return null;
    }
}
function assertWalletMatchesAuthedUser(authedWallet, requestedWallet) {
    return authedWallet === requestedWallet;
}
function calculateFee(amount, bps) {
    return (amount * BigInt(bps)) / 10000n;
}
function toUsdcAmount(shares, pricePerShare) {
    return BigInt(shares) * BigInt(pricePerShare);
}
function serializeUnsignedTx(tx) {
    return tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');
}
function toJsonSafe(value) {
    return JSON.parse(JSON.stringify(value, (_key, currentValue) => (typeof currentValue === 'bigint' ? currentValue.toString() : currentValue)));
}
function getEscrowPda(propertyId) {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from('escrow'), Buffer.from(propertyId)], ESCROW_PROGRAM_ID);
    return pda.toBase58();
}
tradingRouter.get('/escrow/program-status', (req, res) => {
    const propertyId = typeof req.query.propertyId === 'string' ? req.query.propertyId.trim() : '';
    return res.json({
        escrowProgramId: ESCROW_PROGRAM_ID.toBase58(),
        isConfigured: ESCROW_PROGRAM_ID_RAW !== DEFAULT_ESCROW_PROGRAM_ID,
        ...(propertyId ? { sampleEscrowPda: getEscrowPda(propertyId), propertyId } : {}),
    });
});
async function getUsdcTokenAccountAddress(walletAddress) {
    if (!USDC_MINT_ADDRESS)
        return null;
    try {
        const account = await getAssociatedTokenAddress(new PublicKey(USDC_MINT_ADDRESS), new PublicKey(walletAddress));
        return account.toBase58();
    }
    catch {
        return null;
    }
}
async function buildUnsignedMemoTransaction(walletAddress, payload) {
    const connection = getSolanaConnection();
    const wallet = new PublicKey(walletAddress);
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    const memoIx = new TransactionInstruction({
        programId: MEMO_PROGRAM_ID,
        keys: [{ pubkey: wallet, isSigner: true, isWritable: false }],
        data: Buffer.from(JSON.stringify(payload), 'utf8'),
    });
    const tx = new Transaction({
        feePayer: wallet,
        recentBlockhash: blockhash,
    }).add(memoIx);
    return serializeUnsignedTx(tx);
}
async function getConfirmedBlockTime(txSignature) {
    const connection = getSolanaConnection();
    const tx = await connection.getTransaction(txSignature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
    });
    if (!tx)
        throw new Error('Transaction not found on chain');
    if (tx.meta?.err)
        throw new Error('Transaction failed on-chain');
    return BigInt(tx.blockTime ?? Math.floor(Date.now() / 1000));
}
function requiredPropertyPricing(property) {
    if (property.pricePerShare === null || property.availableShares === null) {
        throw new Error('Property pricing is not configured');
    }
    return {
        pricePerShare: property.pricePerShare,
        availableShares: property.availableShares,
    };
}
function computeClaimAmount(totalRental, sharesOwned, totalShares) {
    if (sharesOwned <= 0 || totalShares <= 0)
        return 0n;
    return (totalRental * BigInt(sharesOwned)) / BigInt(totalShares);
}
async function getClaimableForWallet(walletAddress) {
    const investments = await prisma.investment.findMany({
        where: {
            userWallet: walletAddress,
            sharesOwned: { gt: 0 },
        },
        include: {
            property: {
                select: {
                    id: true,
                    totalShares: true,
                },
            },
        },
    });
    if (investments.length === 0)
        return [];
    const propertyIds = investments.map((item) => item.propertyId);
    const [distributions, claims] = await Promise.all([
        prisma.yieldDistribution.findMany({
            where: {
                propertyId: { in: propertyIds },
            },
            select: {
                id: true,
                propertyId: true,
                totalRental: true,
            },
            orderBy: { distributedAt: 'desc' },
        }),
        prisma.yieldClaim.findMany({
            where: {
                userWallet: walletAddress,
                propertyId: { in: propertyIds },
            },
            select: {
                distributionId: true,
            },
        }),
    ]);
    const existingClaimSet = new Set(claims.map((item) => item.distributionId));
    const investmentByProperty = new Map(investments.map((item) => [item.propertyId, item]));
    const claimable = [];
    for (const distribution of distributions) {
        if (existingClaimSet.has(distribution.id))
            continue;
        const investment = investmentByProperty.get(distribution.propertyId);
        if (!investment)
            continue;
        const totalShares = investment.property.totalShares;
        if (typeof totalShares !== 'number' || totalShares <= 0)
            continue;
        const amount = computeClaimAmount(distribution.totalRental, investment.sharesOwned, totalShares);
        if (amount <= 0n)
            continue;
        claimable.push({
            propertyId: distribution.propertyId,
            distributionId: distribution.id,
            amount,
        });
    }
    return claimable;
}
tradingRouter.get('/properties/:id/quote', async (req, res) => {
    try {
        const userWallet = await getUserWalletFromAuthHeader(req.headers.authorization);
        if (!userWallet)
            return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const shares = parsePositiveInt(req.query.shares);
        if (!shares) {
            return res.status(400).json({ message: 'shares query param is required and must be > 0' });
        }
        const property = await prisma.property.findUnique({
            where: { id },
            select: {
                id: true,
                pricePerShare: true,
                availableShares: true,
            },
        });
        if (!property)
            return res.status(404).json({ message: 'Property not found' });
        const { pricePerShare, availableShares } = requiredPropertyPricing(property);
        if (shares > availableShares) {
            return res.status(400).json({ message: 'Requested shares exceed available shares' });
        }
        const usdcRequired = toUsdcAmount(shares, pricePerShare);
        const platformFee = calculateFee(usdcRequired, DEFAULT_PLATFORM_FEE_BPS);
        return res.json({
            pricePerShare,
            platformFeeRate: DEFAULT_PLATFORM_FEE_BPS,
            usdcRequired: usdcRequired.toString(),
            platformFee: platformFee.toString(),
            availableShares,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch quote' });
    }
});
tradingRouter.post('/transactions/initiate-buy', async (req, res) => {
    try {
        const authedWallet = await getUserWalletFromAuthHeader(req.headers.authorization);
        if (!authedWallet)
            return res.status(401).json({ message: 'Unauthorized' });
        const { propertyId, shares, walletAddress } = req.body;
        const parsedShares = parsePositiveInt(shares);
        const parsedWallet = parseWalletAddress(walletAddress);
        if (!propertyId || !parsedShares || !parsedWallet) {
            return res.status(400).json({ message: 'propertyId, shares, walletAddress are required' });
        }
        if (!assertWalletMatchesAuthedUser(authedWallet, parsedWallet)) {
            return res.status(403).json({ message: 'walletAddress does not match authenticated user' });
        }
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            select: {
                id: true,
                pricePerShare: true,
                availableShares: true,
            },
        });
        if (!property)
            return res.status(404).json({ message: 'Property not found' });
        const { pricePerShare, availableShares } = requiredPropertyPricing(property);
        if (parsedShares > availableShares) {
            return res.status(400).json({ message: 'Requested shares exceed available shares' });
        }
        const usdcAmount = toUsdcAmount(parsedShares, pricePerShare);
        const platformFee = calculateFee(usdcAmount, DEFAULT_PLATFORM_FEE_BPS);
        const escrowPDA = getEscrowPda(propertyId);
        const unsignedTx = await buildUnsignedMemoTransaction(parsedWallet, {
            action: 'buy',
            propertyId,
            shares: parsedShares,
            usdcAmount: usdcAmount.toString(),
            platformFee: platformFee.toString(),
            escrowPDA,
        });
        return res.json({
            escrowPDA,
            usdcAmount: usdcAmount.toString(),
            platformFee: platformFee.toString(),
            unsignedTx,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to initiate buy transaction' });
    }
});
tradingRouter.post('/transactions/initiate-sell', async (req, res) => {
    try {
        const authedWallet = await getUserWalletFromAuthHeader(req.headers.authorization);
        if (!authedWallet)
            return res.status(401).json({ message: 'Unauthorized' });
        const { propertyId, shares, walletAddress } = req.body;
        const parsedShares = parsePositiveInt(shares);
        const parsedWallet = parseWalletAddress(walletAddress);
        if (!propertyId || !parsedShares || !parsedWallet) {
            return res.status(400).json({ message: 'propertyId, shares, walletAddress are required' });
        }
        if (!assertWalletMatchesAuthedUser(authedWallet, parsedWallet)) {
            return res.status(403).json({ message: 'walletAddress does not match authenticated user' });
        }
        const investment = await prisma.investment.findUnique({
            where: {
                userWallet_propertyId: {
                    userWallet: parsedWallet,
                    propertyId,
                },
            },
            select: {
                sharesOwned: true,
            },
        });
        if (!investment || investment.sharesOwned < parsedShares) {
            return res.status(400).json({ message: 'Insufficient shares to sell' });
        }
        const unsignedTx = await buildUnsignedMemoTransaction(parsedWallet, {
            action: 'sell',
            propertyId,
            shares: parsedShares,
        });
        return res.json({ unsignedTx });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to initiate sell transaction' });
    }
});
tradingRouter.post('/transactions/confirm', async (req, res) => {
    try {
        const userWallet = await getUserWalletFromAuthHeader(req.headers.authorization);
        if (!userWallet)
            return res.status(401).json({ message: 'Unauthorized' });
        const { txSignature, propertyId, shares, side } = req.body;
        const parsedShares = parsePositiveInt(shares);
        if (!txSignature || !propertyId || !parsedShares) {
            return res.status(400).json({ message: 'txSignature, propertyId and shares are required' });
        }
        const txSide = side === 'sell' ? 'sell' : 'buy';
        const txType = txSide === 'buy' ? 'buy' : 'sell';
        const blockTime = await getConfirmedBlockTime(txSignature);
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                txSignature,
                userWallet,
                propertyId,
                type: txType,
            },
        });
        if (existingTransaction) {
            const investment = await prisma.investment.findUnique({
                where: {
                    userWallet_propertyId: {
                        userWallet,
                        propertyId,
                    },
                },
            });
            return res.json(toJsonSafe({
                success: true,
                investmentRecord: investment,
                updatedInvestment: investment,
                tokenAccountAddress: null,
                alreadyRecorded: true,
            }));
        }
        const result = await prisma.$transaction(async (tx) => {
            const property = await tx.property.findUnique({
                where: { id: propertyId },
                select: {
                    id: true,
                    pricePerShare: true,
                    availableShares: true,
                    mintAddress: true,
                },
            });
            if (!property)
                throw new Error('Property not found');
            const { pricePerShare, availableShares } = requiredPropertyPricing(property);
            const grossAmount = toUsdcAmount(parsedShares, pricePerShare);
            const feeAmount = calculateFee(grossAmount, DEFAULT_PLATFORM_FEE_BPS);
            const netAmount = txSide === 'buy' ? grossAmount : grossAmount - feeAmount;
            const currentInvestment = await tx.investment.findUnique({
                where: {
                    userWallet_propertyId: {
                        userWallet,
                        propertyId,
                    },
                },
            });
            if (txSide === 'buy') {
                if (parsedShares > availableShares) {
                    throw new Error('Requested shares exceed available shares');
                }
                await tx.property.update({
                    where: { id: propertyId },
                    data: {
                        availableShares: availableShares - parsedShares,
                    },
                });
                if (currentInvestment) {
                    const currentShares = currentInvestment.sharesOwned;
                    const newShares = currentShares + parsedShares;
                    const previousCost = currentInvestment.purchasePrice;
                    const newTotalCost = previousCost + grossAmount;
                    const avgCostPerShare = Number(newTotalCost) / newShares;
                    await tx.investment.update({
                        where: {
                            userWallet_propertyId: {
                                userWallet,
                                propertyId,
                            },
                        },
                        data: {
                            sharesOwned: newShares,
                            purchasePrice: newTotalCost,
                            currentValue: BigInt(newShares) * BigInt(pricePerShare),
                            avgCostPerShare: new Prisma.Decimal(avgCostPerShare.toFixed(2)),
                        },
                    });
                }
                else {
                    await tx.investment.create({
                        data: {
                            userWallet,
                            propertyId,
                            sharesOwned: parsedShares,
                            avgCostPerShare: new Prisma.Decimal(pricePerShare.toFixed(2)),
                            purchasePrice: grossAmount,
                            currentValue: grossAmount,
                            yieldEarned: 0n,
                            claimableYield: 0n,
                            tokenAccount: '',
                            investedAt: new Date(),
                        },
                    });
                }
            }
            else {
                if (!currentInvestment || currentInvestment.sharesOwned < parsedShares) {
                    throw new Error('Insufficient shares to sell');
                }
                const newShares = currentInvestment.sharesOwned - parsedShares;
                const avgCost = Number(currentInvestment.avgCostPerShare);
                const reducedCostBasis = BigInt(Math.round(avgCost * parsedShares));
                const newPurchasePrice = currentInvestment.purchasePrice > reducedCostBasis
                    ? currentInvestment.purchasePrice - reducedCostBasis
                    : 0n;
                await tx.property.update({
                    where: { id: propertyId },
                    data: {
                        availableShares: availableShares + parsedShares,
                    },
                });
                await tx.investment.update({
                    where: {
                        userWallet_propertyId: {
                            userWallet,
                            propertyId,
                        },
                    },
                    data: {
                        sharesOwned: newShares,
                        purchasePrice: newPurchasePrice,
                        currentValue: BigInt(newShares) * BigInt(pricePerShare),
                    },
                });
            }
            await tx.transaction.create({
                data: {
                    type: txType,
                    userWallet,
                    propertyId,
                    shares: parsedShares,
                    amountUsdc: grossAmount,
                    platformFee: feeAmount,
                    netAmount,
                    txSignature,
                    status: 'confirmed',
                    blockTime,
                },
            });
            const investment = await tx.investment.findUnique({
                where: {
                    userWallet_propertyId: {
                        userWallet,
                        propertyId,
                    },
                },
            });
            return {
                investment,
                propertyMintAddress: property.mintAddress,
            };
        });
        let tokenAccountAddress = null;
        if (result.propertyMintAddress) {
            try {
                tokenAccountAddress = (await getAssociatedTokenAddress(new PublicKey(result.propertyMintAddress), new PublicKey(userWallet))).toBase58();
            }
            catch {
                tokenAccountAddress = null;
            }
        }
        return res.json(toJsonSafe({
            success: true,
            investmentRecord: result.investment,
            updatedInvestment: result.investment,
            tokenAccountAddress,
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to confirm transaction' });
    }
});
tradingRouter.get('/investments/:propertyId/sell-quote', async (req, res) => {
    try {
        const userWallet = await getUserWalletFromAuthHeader(req.headers.authorization);
        if (!userWallet)
            return res.status(401).json({ message: 'Unauthorized' });
        const { propertyId } = req.params;
        const shares = parsePositiveInt(req.query.shares);
        const walletFromQuery = parseWalletAddress(req.query.walletAddress);
        if (!shares) {
            return res.status(400).json({ message: 'shares query param is required and must be > 0' });
        }
        if (walletFromQuery && !assertWalletMatchesAuthedUser(userWallet, walletFromQuery)) {
            return res.status(403).json({ message: 'walletAddress does not match authenticated user' });
        }
        const [property, investment] = await Promise.all([
            prisma.property.findUnique({
                where: { id: propertyId },
                select: {
                    pricePerShare: true,
                },
            }),
            prisma.investment.findUnique({
                where: {
                    userWallet_propertyId: {
                        userWallet,
                        propertyId,
                    },
                },
                select: {
                    sharesOwned: true,
                    avgCostPerShare: true,
                },
            }),
        ]);
        if (!property || property.pricePerShare === null) {
            return res.status(404).json({ message: 'Property pricing not found' });
        }
        if (!investment || investment.sharesOwned < shares) {
            return res.status(400).json({ message: 'Insufficient shares to sell' });
        }
        const proceedsUsdc = toUsdcAmount(shares, property.pricePerShare);
        const feeAmount = calculateFee(proceedsUsdc, DEFAULT_PLATFORM_FEE_BPS);
        const netProceeds = proceedsUsdc - feeAmount;
        const costBasis = BigInt(Math.round(Number(investment.avgCostPerShare) * shares));
        const pnl = netProceeds - costBasis;
        return res.json({
            proceedsUsdc: proceedsUsdc.toString(),
            feeAmount: feeAmount.toString(),
            netProceeds: netProceeds.toString(),
            pnl: pnl.toString(),
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to get sell quote' });
    }
});
tradingRouter.get('/investments/me', async (req, res) => {
    try {
        const userWallet = await getUserWalletFromAuthHeader(req.headers.authorization);
        if (!userWallet)
            return res.status(401).json({ message: 'Unauthorized' });
        const [investments, ownedProperties] = await Promise.all([
            prisma.investment.findMany({
                where: { userWallet },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            ownerWallet: true,
                            pricePerShare: true,
                            status: true,
                        },
                    },
                },
                orderBy: { investedAt: 'desc' },
            }),
            prisma.property.findMany({
                where: { ownerWallet: userWallet },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    totalShares: true,
                    availableShares: true,
                    pricePerShare: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        const purchasedInvestments = investments.map((item) => ({
            propertyId: item.propertyId,
            propertyName: item.property.name,
            propertyStatus: item.property.status,
            sharesOwned: item.sharesOwned,
            avgCostPerShare: item.avgCostPerShare.toString(),
            purchasePrice: item.purchasePrice.toString(),
            currentValue: item.currentValue.toString(),
            yieldEarned: item.yieldEarned.toString(),
            claimableYield: item.claimableYield.toString(),
            investedAt: item.investedAt,
            isOwner: item.property.ownerWallet === userWallet,
            currentPricePerShare: item.property.pricePerShare,
        }));
        const ownedListings = ownedProperties.map((property) => {
            const soldShares = (typeof property.totalShares === 'number' && typeof property.availableShares === 'number')
                ? property.totalShares - property.availableShares
                : null;
            return {
                propertyId: property.id,
                propertyName: property.name,
                status: property.status,
                totalShares: property.totalShares,
                availableShares: property.availableShares,
                soldShares,
                pricePerShare: property.pricePerShare,
                createdAt: property.createdAt,
            };
        });
        const purchasedTotals = investments.reduce((acc, item) => {
            acc.totalSharesOwned += item.sharesOwned;
            acc.totalPurchasePrice += item.purchasePrice;
            acc.totalCurrentValue += item.currentValue;
            acc.totalYieldEarned += item.yieldEarned;
            acc.totalClaimableYield += item.claimableYield;
            return acc;
        }, {
            totalSharesOwned: 0,
            totalPurchasePrice: 0n,
            totalCurrentValue: 0n,
            totalYieldEarned: 0n,
            totalClaimableYield: 0n,
        });
        const listingTotals = ownedProperties.reduce((acc, property) => {
            const totalShares = property.totalShares ?? 0;
            const availableShares = property.availableShares ?? 0;
            const soldShares = totalShares - availableShares;
            acc.totalSharesIssued += totalShares;
            acc.totalSharesAvailable += availableShares;
            acc.totalSharesSold += soldShares > 0 ? soldShares : 0;
            return acc;
        }, {
            totalSharesIssued: 0,
            totalSharesAvailable: 0,
            totalSharesSold: 0,
        });
        return res.json(toJsonSafe({
            walletAddress: userWallet,
            purchasedTotals: {
                propertiesCount: purchasedInvestments.length,
                totalSharesOwned: purchasedTotals.totalSharesOwned,
                totalPurchasePrice: purchasedTotals.totalPurchasePrice,
                totalCurrentValue: purchasedTotals.totalCurrentValue,
                totalYieldEarned: purchasedTotals.totalYieldEarned,
                totalClaimableYield: purchasedTotals.totalClaimableYield,
            },
            purchasedInvestments,
            ownedListingsTotals: {
                propertiesCount: ownedListings.length,
                totalSharesIssued: listingTotals.totalSharesIssued,
                totalSharesAvailable: listingTotals.totalSharesAvailable,
                totalSharesSold: listingTotals.totalSharesSold,
            },
            ownedListings,
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch investment portfolio' });
    }
});
tradingRouter.get('/transactions/me', async (req, res) => {
    try {
        const userWallet = await getUserWalletFromAuthHeader(req.headers.authorization);
        if (!userWallet)
            return res.status(401).json({ message: 'Unauthorized' });
        const page = parsePositiveInt(req.query.page) ?? 1;
        const requestedLimit = parsePositiveInt(req.query.limit) ?? 20;
        const limit = Math.min(requestedLimit, 100);
        const skip = (page - 1) * limit;
        const typeQuery = typeof req.query.type === 'string' ? req.query.type.trim() : '';
        const validTypes = new Set(['buy', 'sell', 'yieldClaim', 'listFee', 'transfer']);
        if (typeQuery && !validTypes.has(typeQuery)) {
            return res.status(400).json({ message: 'Invalid type. Use buy, sell, yieldClaim, listFee, transfer' });
        }
        const whereClause = {
            userWallet,
            ...(typeQuery ? { type: typeQuery } : {}),
        };
        const [transactions, total, usdcWalletAddress] = await Promise.all([
            prisma.transaction.findMany({
                where: whereClause,
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.transaction.count({ where: whereClause }),
            getUsdcTokenAccountAddress(userWallet),
        ]);
        const totals = transactions.reduce((acc, tx) => {
            acc.grossAmountUsdc += tx.amountUsdc;
            acc.totalFeesUsdc += tx.platformFee;
            acc.netAmountUsdc += tx.netAmount;
            return acc;
        }, {
            grossAmountUsdc: 0n,
            totalFeesUsdc: 0n,
            netAmountUsdc: 0n,
        });
        return res.json(toJsonSafe({
            walletAddress: userWallet,
            usdcWalletAddress,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            totals,
            transactions,
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch transaction history' });
    }
});
tradingRouter.get('/yield/claimable', async (req, res) => {
    try {
        const authedWallet = await getUserWalletFromAuthHeader(req.headers.authorization);
        if (!authedWallet)
            return res.status(401).json({ message: 'Unauthorized' });
        const walletParam = parseWalletAddress(req.query.wallet);
        const wallet = walletParam ?? authedWallet;
        if (!assertWalletMatchesAuthedUser(authedWallet, wallet)) {
            return res.status(403).json({ message: 'wallet does not match authenticated user' });
        }
        const claimable = await getClaimableForWallet(wallet);
        return res.json(claimable.map((item) => ({
            propertyId: item.propertyId,
            distributionId: item.distributionId,
            amount: item.amount.toString(),
        })));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch claimable yields' });
    }
});
tradingRouter.post('/yield/claim', async (req, res) => {
    try {
        const authedWallet = await getUserWalletFromAuthHeader(req.headers.authorization);
        if (!authedWallet)
            return res.status(401).json({ message: 'Unauthorized' });
        const { walletAddress, claims } = req.body;
        const parsedWallet = parseWalletAddress(walletAddress);
        if (!parsedWallet) {
            return res.status(400).json({ message: 'walletAddress is required' });
        }
        if (!assertWalletMatchesAuthedUser(authedWallet, parsedWallet)) {
            return res.status(403).json({ message: 'walletAddress does not match authenticated user' });
        }
        if (!Array.isArray(claims) || claims.length === 0) {
            return res.status(400).json({ message: 'claims array is required' });
        }
        const claimable = await getClaimableForWallet(parsedWallet);
        const claimableMap = new Map(claimable.map((item) => [`${item.propertyId}:${item.distributionId}`, item]));
        const selectedClaims = [];
        for (const claim of claims) {
            if (!claim.propertyId || !claim.distributionId) {
                return res.status(400).json({ message: 'Each claim requires propertyId and distributionId' });
            }
            const key = `${claim.propertyId}:${claim.distributionId}`;
            const match = claimableMap.get(key);
            if (!match) {
                return res.status(400).json({ message: `Claim not available: ${key}` });
            }
            selectedClaims.push(match);
        }
        const unsignedTx = await buildUnsignedMemoTransaction(parsedWallet, {
            action: 'yield_claim',
            claims: selectedClaims.map((item) => ({
                propertyId: item.propertyId,
                distributionId: item.distributionId,
                amount: item.amount.toString(),
            })),
        });
        const totalClaimable = selectedClaims.reduce((acc, item) => acc + item.amount, 0n);
        return res.json({
            unsignedTx,
            totalClaimable: totalClaimable.toString(),
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to initiate yield claim' });
    }
});
tradingRouter.post('/yield/confirm-claim', async (req, res) => {
    try {
        const authedWallet = await getUserWalletFromAuthHeader(req.headers.authorization);
        if (!authedWallet)
            return res.status(401).json({ message: 'Unauthorized' });
        const { txSignature, claims } = req.body;
        if (!txSignature) {
            return res.status(400).json({ message: 'txSignature is required' });
        }
        const blockTime = await getConfirmedBlockTime(txSignature);
        const claimable = await getClaimableForWallet(authedWallet);
        const claimableMap = new Map(claimable.map((item) => [`${item.propertyId}:${item.distributionId}`, item]));
        const requestedClaims = Array.isArray(claims) && claims.length > 0
            ? claims
            : claimable.map((item) => ({ propertyId: item.propertyId, distributionId: item.distributionId }));
        if (requestedClaims.length === 0) {
            return res.json({ totalClaimed: '0', updatedBalance: '0' });
        }
        const selectedClaims = [];
        for (const claim of requestedClaims) {
            if (!claim.propertyId || !claim.distributionId) {
                return res.status(400).json({ message: 'Each claim requires propertyId and distributionId' });
            }
            const key = `${claim.propertyId}:${claim.distributionId}`;
            const match = claimableMap.get(key);
            if (!match) {
                return res.status(400).json({ message: `Claim not available: ${key}` });
            }
            selectedClaims.push(match);
        }
        const totals = await prisma.$transaction(async (tx) => {
            let totalClaimed = 0n;
            for (const claim of selectedClaims) {
                const existingClaim = await tx.yieldClaim.findUnique({
                    where: {
                        userWallet_propertyId_distributionId: {
                            userWallet: authedWallet,
                            propertyId: claim.propertyId,
                            distributionId: claim.distributionId,
                        },
                    },
                });
                if (existingClaim)
                    continue;
                await tx.yieldClaim.create({
                    data: {
                        userWallet: authedWallet,
                        propertyId: claim.propertyId,
                        distributionId: claim.distributionId,
                        amountUsdc: claim.amount,
                        txSignature,
                        claimedAt: new Date(),
                    },
                });
                await tx.transaction.create({
                    data: {
                        type: 'yieldClaim',
                        userWallet: authedWallet,
                        propertyId: claim.propertyId,
                        amountUsdc: claim.amount,
                        platformFee: 0n,
                        netAmount: claim.amount,
                        txSignature,
                        status: 'confirmed',
                        blockTime,
                    },
                });
                const investment = await tx.investment.findUnique({
                    where: {
                        userWallet_propertyId: {
                            userWallet: authedWallet,
                            propertyId: claim.propertyId,
                        },
                    },
                });
                if (investment) {
                    const nextYieldEarned = investment.yieldEarned + claim.amount;
                    const nextClaimableYield = investment.claimableYield > claim.amount
                        ? investment.claimableYield - claim.amount
                        : 0n;
                    await tx.investment.update({
                        where: {
                            userWallet_propertyId: {
                                userWallet: authedWallet,
                                propertyId: claim.propertyId,
                            },
                        },
                        data: {
                            yieldEarned: nextYieldEarned,
                            claimableYield: nextClaimableYield,
                            lastYieldClaim: new Date(),
                        },
                    });
                }
                totalClaimed += claim.amount;
            }
            const portfolio = await tx.investment.aggregate({
                where: { userWallet: authedWallet },
                _sum: { claimableYield: true },
            });
            return {
                totalClaimed,
                updatedBalance: portfolio._sum.claimableYield ?? 0n,
            };
        });
        return res.json({
            totalClaimed: totals.totalClaimed.toString(),
            updatedBalance: totals.updatedBalance.toString(),
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to confirm yield claim' });
    }
});
export default tradingRouter;
//# sourceMappingURL=trading.route.js.map