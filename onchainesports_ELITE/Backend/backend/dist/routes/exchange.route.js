import { Router } from 'express';
import jwt from 'jsonwebtoken';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, clusterApiUrl, sendAndConfirmTransaction, } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, MINT_SIZE, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createInitializeMintInstruction, createMintToInstruction, createTransferInstruction, getAssociatedTokenAddress, getMinimumBalanceForRentExemptMint, } from '@solana/spl-token';
import { Prisma, PredictionSide } from '../generated/prisma/client.js';
import { prisma } from '../prisma.config.js';
import { uploadFile } from '../config/imageKit.config.js';
const exchangeRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'hello world';
const AUTH_MESSAGE = process.env.AUTH_SIGN_MESSAGE ?? 'Sign into mechanical turks';
const DEFAULT_ESCROW_PROGRAM_ID = '11111111111111111111111111111111';
const ESCROW_PROGRAM_ID_RAW = process.env.ESCROW_PROGRAM_ID ?? DEFAULT_ESCROW_PROGRAM_ID;
const ESCROW_PROGRAM_ID = new PublicKey(ESCROW_PROGRAM_ID_RAW);
const PLATFORM_FEE_BPS = (() => {
    const parsed = Number(process.env.PLATFORM_FEE_BPS ?? '100');
    if (!Number.isFinite(parsed) || parsed < 0)
        return 100;
    return Math.min(200, Math.max(0, Math.round(parsed)));
})();
const SOL_PER_USDC = (() => {
    const parsed = Number(process.env.SOL_PER_USDC ?? '0.0001');
    if (!Number.isFinite(parsed) || parsed <= 0)
        return 0.0001;
    return parsed;
})();
const USDC_DECIMALS = (() => {
    const parsed = Number(process.env.USDC_DECIMALS ?? '6');
    if (!Number.isFinite(parsed))
        return 6;
    return Math.max(0, Math.min(9, Math.trunc(parsed)));
})();
const VOLATILITY_PRESETS = {
    LOW: 0.01,
    MEDIUM: 0.05,
    HIGH: 0.1,
};
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
async function getUserFromAuthHeader(authHeader) {
    const userId = getUserIdFromAuthHeader(authHeader);
    if (!userId)
        return null;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, walletAddress: true },
    });
    if (!user)
        return null;
    return user;
}
function normalizeSignature(input) {
    if (!input)
        return null;
    if (Array.isArray(input))
        return new Uint8Array(input);
    if (typeof input === 'string') {
        try {
            return new Uint8Array(Buffer.from(input, 'base64'));
        }
        catch {
            return null;
        }
    }
    if (typeof input === 'object') {
        const obj = input;
        if (Array.isArray(obj.data)) {
            return new Uint8Array(obj.data);
        }
        const numericKeys = Object.keys(obj).filter((k) => /^\d+$/.test(k));
        if (numericKeys.length > 0) {
            const arr = numericKeys
                .sort((a, b) => Number(a) - Number(b))
                .map((k) => Number(obj[k]));
            return new Uint8Array(arr);
        }
    }
    return null;
}
function parseWalletAddress(value) {
    if (typeof value !== 'string' || !value.trim())
        return null;
    try {
        const wallet = new PublicKey(value.trim());
        return wallet.toBase58();
    }
    catch {
        return null;
    }
}
function isAdminRequest(req, userWallet) {
    const adminApiKey = process.env.ADMIN_API_KEY;
    const headerKey = typeof req.headers['x-admin-key'] === 'string' ? req.headers['x-admin-key'] : '';
    if (adminApiKey && headerKey && headerKey === adminApiKey)
        return true;
    if (!userWallet)
        return false;
    const adminWallets = (process.env.ADMIN_WALLETS ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    return adminWallets.includes(userWallet);
}
function getSolanaConnection() {
    const rpcUrl = process.env.SOLANA_RPC_URL ?? clusterApiUrl('devnet');
    return new Connection(rpcUrl, 'confirmed');
}
function getPlatformSigner() {
    const secret = process.env.PLATFORM_SIGNER_SECRET;
    if (!secret) {
        throw new Error('Missing PLATFORM_SIGNER_SECRET env var');
    }
    try {
        if (secret.trim().startsWith('[')) {
            const parsed = JSON.parse(secret);
            if (!Array.isArray(parsed)) {
                throw new Error('PLATFORM_SIGNER_SECRET JSON must be a number array');
            }
            return Keypair.fromSecretKey(Uint8Array.from(parsed));
        }
        return Keypair.fromSecretKey(bs58.decode(secret.trim()));
    }
    catch (error) {
        throw new Error(`Invalid PLATFORM_SIGNER_SECRET format: ${error.message}`);
    }
}
function getUsdcMint() {
    const mint = process.env.USDC_MINT_ADDRESS;
    if (!mint || !mint.trim()) {
        throw new Error('Missing USDC_MINT_ADDRESS env var');
    }
    try {
        return new PublicKey(mint.trim());
    }
    catch {
        throw new Error('Invalid USDC_MINT_ADDRESS env var');
    }
}
function toTokenBaseUnits(amount, decimals) {
    if (!Number.isFinite(amount) || amount < 0)
        return 0n;
    const multiplier = 10 ** decimals;
    return BigInt(Math.round(amount * multiplier));
}
function quoteAmountToSol(amount) {
    if (!Number.isFinite(amount) || amount <= 0)
        return 0;
    return Number((amount * SOL_PER_USDC).toFixed(9));
}
function quoteAmountToLamports(amount) {
    const solAmount = quoteAmountToSol(amount);
    return Math.max(1, Math.floor(solAmount * LAMPORTS_PER_SOL));
}
async function getTokenProgramForMint(connection, mint) {
    const mintAccount = await connection.getAccountInfo(mint);
    if (!mintAccount) {
        throw new Error(`Mint not found: ${mint.toBase58()}`);
    }
    if (mintAccount.owner.equals(TOKEN_PROGRAM_ID) || mintAccount.owner.equals(TOKEN_2022_PROGRAM_ID)) {
        return mintAccount.owner;
    }
    throw new Error(`Unsupported token program for mint: ${mint.toBase58()}`);
}
async function fundUserUsdcWallet(params) {
    const connection = getSolanaConnection();
    const payer = getPlatformSigner();
    const usdcMint = getUsdcMint();
    const usdcTokenProgram = await getTokenProgramForMint(connection, usdcMint);
    const recipient = new PublicKey(params.walletAddress);
    const treasuryUsdcAta = await getAssociatedTokenAddress(usdcMint, payer.publicKey, false, usdcTokenProgram, ASSOCIATED_TOKEN_PROGRAM_ID);
    const userUsdcAta = await getAssociatedTokenAddress(usdcMint, recipient, false, usdcTokenProgram, ASSOCIATED_TOKEN_PROGRAM_ID);
    const amountBaseUnits = toTokenBaseUnits(params.amount, USDC_DECIMALS);
    if (amountBaseUnits <= 0n) {
        throw new Error('amount must be greater than zero');
    }
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash });
    if (!(await connection.getAccountInfo(treasuryUsdcAta))) {
        tx.add(createAssociatedTokenAccountInstruction(payer.publicKey, treasuryUsdcAta, payer.publicKey, usdcMint, usdcTokenProgram, ASSOCIATED_TOKEN_PROGRAM_ID));
    }
    if (!(await connection.getAccountInfo(userUsdcAta))) {
        tx.add(createAssociatedTokenAccountInstruction(payer.publicKey, userUsdcAta, recipient, usdcMint, usdcTokenProgram, ASSOCIATED_TOKEN_PROGRAM_ID));
    }
    tx.add(createTransferInstruction(treasuryUsdcAta, userUsdcAta, payer.publicKey, amountBaseUnits, [], usdcTokenProgram));
    const txSignature = await sendAndConfirmTransaction(connection, tx, [payer], { commitment: 'confirmed' });
    return {
        txSignature,
        userUsdcAta: userUsdcAta.toBase58(),
        treasuryUsdcAta: treasuryUsdcAta.toBase58(),
        amount: params.amount,
        amountBaseUnits: amountBaseUnits.toString(),
    };
}
async function mintAssetToken(params) {
    const connection = getSolanaConnection();
    const payer = getPlatformSigner();
    const owner = new PublicKey(params.ownerWallet);
    const mintKeypair = Keypair.generate();
    const lamportsForMint = await getMinimumBalanceForRentExemptMint(connection);
    const ownerTokenAccount = await getAssociatedTokenAddress(mintKeypair.publicKey, owner, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    const treasuryTokenAccount = await getAssociatedTokenAddress(mintKeypair.publicKey, payer.publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    const tx = new Transaction().add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: lamportsForMint,
        programId: TOKEN_PROGRAM_ID,
    }), createInitializeMintInstruction(mintKeypair.publicKey, 0, payer.publicKey, payer.publicKey, TOKEN_PROGRAM_ID), createAssociatedTokenAccountInstruction(payer.publicKey, ownerTokenAccount, owner, mintKeypair.publicKey, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID), createMintToInstruction(mintKeypair.publicKey, ownerTokenAccount, payer.publicKey, BigInt(params.totalSupply), [], TOKEN_PROGRAM_ID));
    const txSignature = await sendAndConfirmTransaction(connection, tx, [payer, mintKeypair], {
        commitment: 'confirmed',
    });
    return {
        mintAddress: mintKeypair.publicKey.toBase58(),
        treasuryPda: treasuryTokenAccount.toBase58(),
        txSignature,
    };
}
async function uploadAssetMetadata(params) {
    const metadata = {
        name: params.name,
        symbol: 'ESP-TEAM',
        description: `Esports team asset token for ${params.teamName ?? 'Unknown Team'}`,
        attributes: [
            { trait_type: 'team', value: params.teamName ?? 'N/A' },
            { trait_type: 'game', value: params.teamGame ?? 'N/A' },
            { trait_type: 'region', value: params.teamRegion ?? 'N/A' },
            { trait_type: 'base_price', value: params.basePrice },
            { trait_type: 'k_factor', value: params.kFactor },
        ],
    };
    try {
        const uploaded = await uploadFile(Buffer.from(JSON.stringify(metadata, null, 2), 'utf8'), `${params.name.replace(/\s+/g, '-').toLowerCase()}-metadata.json`);
        return uploaded.url ?? null;
    }
    catch {
        return null;
    }
}
async function uploadCollectionMetadata(params) {
    const metadata = {
        name: params.name,
        symbol: 'ESP-COLLECTION',
        description: params.description ?? `Collection for ${params.name}`,
        collectionMint: params.collectionMint ?? null,
    };
    try {
        const uploaded = await uploadFile(Buffer.from(JSON.stringify(metadata, null, 2), 'utf8'), `${params.name.replace(/\s+/g, '-').toLowerCase()}-collection-metadata.json`);
        return uploaded.url ?? null;
    }
    catch {
        return null;
    }
}
async function uploadLandMetadata(params) {
    let imageUrl = null;
    const imageBuffer = parseBase64Image(params.imageBase64);
    if (imageBuffer) {
        try {
            const uploadedImage = await uploadFile(imageBuffer, `${params.name.replace(/\s+/g, '-').toLowerCase()}-land-image.jpg`);
            imageUrl = uploadedImage.url ?? null;
        }
        catch {
            imageUrl = null;
        }
    }
    const metadata = {
        name: params.name,
        symbol: 'ESP-LAND',
        description: params.description ?? `Land NFT for ${params.name}`,
        image: imageUrl,
        attributes: [
            { trait_type: 'asset_type', value: 'LAND' },
            { trait_type: 'location', value: params.location ?? 'N/A' },
            { trait_type: 'base_price', value: params.basePrice },
            { trait_type: 'k_factor', value: params.kFactor },
        ],
    };
    try {
        const uploaded = await uploadFile(Buffer.from(JSON.stringify(metadata, null, 2), 'utf8'), `${params.name.replace(/\s+/g, '-').toLowerCase()}-land-metadata.json`);
        return uploaded.url ?? null;
    }
    catch {
        return null;
    }
}
function toJsonSafe(value) {
    if (typeof value === 'bigint')
        return value.toString();
    if (value instanceof Date)
        return value.toISOString();
    if (Prisma.Decimal.isDecimal(value))
        return value.toString();
    if (Array.isArray(value)) {
        return value.map((item) => toJsonSafe(item));
    }
    if (value && typeof value === 'object') {
        const entries = Object.entries(value).map(([key, item]) => [key, toJsonSafe(item)]);
        return Object.fromEntries(entries);
    }
    return value;
}
function requirePositiveNumber(value) {
    const parsed = typeof value === 'string' ? Number(value) : value;
    if (typeof parsed !== 'number' || !Number.isFinite(parsed) || parsed <= 0)
        return null;
    return parsed;
}
function requirePositiveInt(value) {
    const parsed = requirePositiveNumber(value);
    if (!parsed)
        return null;
    return Math.trunc(parsed);
}
function parseVolatilityPreset(value) {
    if (typeof value !== 'string')
        return null;
    const normalized = value.trim().toUpperCase();
    if (normalized === 'LOW' || normalized === 'MEDIUM' || normalized === 'HIGH')
        return normalized;
    return null;
}
function resolveCurveK(params) {
    const fromPreset = parseVolatilityPreset(params.preset);
    const parsedExplicit = requirePositiveNumber(params.explicitK);
    const parsedAlias = requirePositiveNumber(params.aliasK);
    const resolved = parsedExplicit ?? parsedAlias ?? (fromPreset ? VOLATILITY_PRESETS[fromPreset] : null);
    if (!resolved)
        return null;
    if (resolved < params.min || resolved > params.max)
        return null;
    return resolved;
}
function computeFeeBreakdown(baseAmount) {
    const feeAmount = Number(((baseAmount * PLATFORM_FEE_BPS) / 10000).toFixed(6));
    return {
        feeBps: PLATFORM_FEE_BPS,
        feeAmount,
        grossAmount: Number((baseAmount + feeAmount).toFixed(6)),
        netAmount: Number((baseAmount - feeAmount).toFixed(6)),
    };
}
function parseBase64Image(input) {
    if (typeof input !== 'string' || !input.trim())
        return null;
    const normalized = input.includes(',') ? input.split(',').pop() ?? '' : input;
    try {
        const buffer = Buffer.from(normalized, 'base64');
        if (!buffer.length)
            return null;
        return buffer;
    }
    catch {
        return null;
    }
}
function getEscrowPda(propertyId) {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from('escrow'), Buffer.from(propertyId)], ESCROW_PROGRAM_ID);
    return pda.toBase58();
}
async function sendSolPayoutToUser(walletAddress, payoutUsdc) {
    throw new Error(`Legacy function disabled. Configure USDC settlement; requested payout for wallet ${walletAddress} amount ${payoutUsdc}`);
}
function priceAt(basePrice, kFactor, supply) {
    return basePrice + (kFactor * supply);
}
function buyCost(basePrice, kFactor, currentSupply, quantity) {
    return (quantity * basePrice) + (kFactor * ((quantity * currentSupply) + ((quantity * (quantity - 1)) / 2)));
}
function sellPayout(basePrice, kFactor, currentSupply, quantity) {
    return (quantity * basePrice) + (kFactor * ((quantity * (currentSupply - 1)) - ((quantity * (quantity - 1)) / 2)));
}
function marketSidePrice(basePrice, kFactor, sideSupply) {
    return basePrice + (kFactor * sideSupply);
}
function marketBuyCost(basePrice, kFactor, sideSupply, quantity) {
    return (quantity * basePrice) + (kFactor * ((quantity * sideSupply) + ((quantity * (quantity - 1)) / 2)));
}
function marketSellPayout(basePrice, kFactor, sideSupply, quantity) {
    return (quantity * basePrice) + (kFactor * ((quantity * (sideSupply - 1)) - ((quantity * (quantity - 1)) / 2)));
}
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
async function sendMemoTransaction(payload) {
    const connection = getSolanaConnection();
    const payer = getPlatformSigner();
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    const memoIx = new TransactionInstruction({
        programId: MEMO_PROGRAM_ID,
        keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: false }],
        data: Buffer.from(JSON.stringify(payload), 'utf8'),
    });
    const tx = new Transaction({
        feePayer: payer.publicKey,
        recentBlockhash: blockhash,
    }).add(memoIx);
    return sendAndConfirmTransaction(connection, tx, [payer], { commitment: 'confirmed' });
}
async function wait(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}
async function getConfirmedTxMemo(signature) {
    const connection = getSolanaConnection();
    const memoAddr = MEMO_PROGRAM_ID.toBase58();
    for (let attempt = 0; attempt < 7; attempt += 1) {
        const parsed = await connection.getParsedTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });
        if (!parsed) {
            if (attempt < 6)
                await wait(700);
            continue;
        }
        if (parsed.meta?.err)
            return null;
        for (const ix of parsed.transaction.message.instructions) {
            if (ix.programId.toBase58() !== memoAddr)
                continue;
            if ('parsed' in ix && typeof ix.parsed === 'string') {
                try {
                    return JSON.parse(ix.parsed);
                }
                catch {
                    return null;
                }
            }
            if ('data' in ix) {
                try {
                    return JSON.parse(Buffer.from(bs58.decode(ix.data)).toString('utf8'));
                }
                catch {
                    return null;
                }
            }
        }
        return null;
    }
    return null;
}
exchangeRouter.post('/auth/wallet', async (req, res) => {
    try {
        const { walletAddress, signature } = req.body;
        const parsedWallet = parseWalletAddress(walletAddress);
        if (!parsedWallet) {
            return res.status(400).json({ message: 'Invalid walletAddress' });
        }
        const sigBytes = normalizeSignature(signature);
        if (!sigBytes || sigBytes.length !== 64) {
            return res.status(400).json({ message: 'Invalid signature format/size (expected 64 bytes)' });
        }
        const message = new TextEncoder().encode(AUTH_MESSAGE);
        const isValid = nacl.sign.detached.verify(message, sigBytes, new PublicKey(parsedWallet).toBytes());
        if (!isValid) {
            return res.status(401).json({ message: 'Incorrect signature' });
        }
        const existingUser = await prisma.user.findUnique({ where: { walletAddress: parsedWallet } });
        const user = existingUser ?? await prisma.user.create({ data: { walletAddress: parsedWallet } });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        return res.json({
            message: existingUser ? 'existing' : 'created',
            token,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                username: user.username,
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed wallet auth' });
    }
});
exchangeRouter.post('/auth/admin', async (req, res) => {
    try {
        const { walletAddress, signature } = req.body;
        const parsedWallet = parseWalletAddress(walletAddress);
        if (!parsedWallet) {
            return res.status(400).json({ message: 'Invalid walletAddress' });
        }
        const sigBytes = normalizeSignature(signature);
        if (!sigBytes || sigBytes.length !== 64) {
            return res.status(400).json({ message: 'Invalid signature format/size (expected 64 bytes)' });
        }
        const message = new TextEncoder().encode(AUTH_MESSAGE);
        const isValid = nacl.sign.detached.verify(message, sigBytes, new PublicKey(parsedWallet).toBytes());
        if (!isValid) {
            return res.status(401).json({ message: 'Incorrect signature' });
        }
        const adminWallets = (process.env.ADMIN_WALLETS ?? '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        if (!adminWallets.includes(parsedWallet)) {
            return res.status(403).json({ message: 'Wallet is not an admin' });
        }
        const existingUser = await prisma.user.findUnique({ where: { walletAddress: parsedWallet } });
        const user = existingUser ?? await prisma.user.create({ data: { walletAddress: parsedWallet } });
        const token = jwt.sign({ userId: user.id, isAdmin: true }, JWT_SECRET);
        return res.json({
            message: 'Admin authenticated',
            token,
            isAdmin: true,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                username: user.username,
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed admin auth' });
    }
});
exchangeRouter.post('/admin/teams', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { name, game, region, logoUrl } = req.body;
        if (typeof name !== 'string' || !name.trim() || typeof game !== 'string' || !game.trim()) {
            return res.status(400).json({ message: 'name and game are required' });
        }
        const team = await prisma.team.create({
            data: {
                name: name.trim(),
                game: game.trim(),
                region: typeof region === 'string' ? region.trim() : null,
                logoUrl: typeof logoUrl === 'string' ? logoUrl.trim() : null,
            },
        });
        return res.status(201).json({ message: 'Team created', team });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to create team' });
    }
});
exchangeRouter.post('/admin/collections', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { name, description, collectionMint, metadataUri } = req.body;
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ message: 'name is required' });
        }
        const normalizedName = name.trim();
        const normalizedDescription = typeof description === 'string' ? description.trim() : null;
        const normalizedCollectionMint = typeof collectionMint === 'string' ? collectionMint.trim() : null;
        const providedMetadataUri = typeof metadataUri === 'string' ? metadataUri.trim() : null;
        const generatedMetadataUri = providedMetadataUri
            ? null
            : await uploadCollectionMetadata({
                name: normalizedName,
                ...(normalizedDescription ? { description: normalizedDescription } : {}),
                ...(normalizedCollectionMint ? { collectionMint: normalizedCollectionMint } : {}),
            });
        const resolvedMetadataUri = providedMetadataUri || generatedMetadataUri;
        const collection = await prisma.assetCollection.create({
            data: {
                name: normalizedName,
                description: normalizedDescription,
                collectionMint: normalizedCollectionMint,
                metadataUri: resolvedMetadataUri,
            },
        });
        return res.status(201).json({
            message: 'Collection created',
            collection,
            metadataSource: providedMetadataUri ? 'provided' : generatedMetadataUri ? 'generated' : 'none',
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to create collection' });
    }
});
exchangeRouter.post('/admin/assets/mint', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { name, teamId, collectionId, totalSupply, basePrice, kFactor, bondingCurveK, volatilityPreset } = req.body;
        if (typeof name !== 'string' || !name.trim() || typeof teamId !== 'string' || !teamId.trim()) {
            return res.status(400).json({ message: 'name and teamId are required' });
        }
        const supply = requirePositiveInt(totalSupply);
        const parsedBasePrice = requirePositiveNumber(basePrice);
        const parsedKFactor = resolveCurveK({
            explicitK: kFactor,
            aliasK: bondingCurveK,
            preset: volatilityPreset,
            min: 0.001,
            max: 2,
        });
        if (!supply || !parsedBasePrice || !parsedKFactor) {
            return res.status(400).json({ message: 'totalSupply, basePrice and kFactor/bondingCurveK (or volatilityPreset) are required with valid limits' });
        }
        const [team, collection] = await Promise.all([
            prisma.team.findUnique({ where: { id: teamId.trim() } }),
            typeof collectionId === 'string' && collectionId.trim()
                ? prisma.assetCollection.findUnique({ where: { id: collectionId.trim() } })
                : Promise.resolve(null),
        ]);
        if (!team)
            return res.status(404).json({ message: 'Team not found' });
        if (collectionId && !collection)
            return res.status(404).json({ message: 'Collection not found' });
        const mintOwner = process.env.ADMIN_MINT_WALLET ?? getPlatformSigner().publicKey.toBase58();
        const { mintAddress, treasuryPda, txSignature } = await mintAssetToken({
            ownerWallet: mintOwner,
            totalSupply: supply,
        });
        const metadataUri = await uploadAssetMetadata({
            name: name.trim(),
            teamName: team.name,
            teamGame: team.game,
            basePrice: parsedBasePrice,
            kFactor: parsedKFactor,
            ...(team.region ? { teamRegion: team.region } : {}),
        });
        const asset = await prisma.asset.create({
            data: {
                name: name.trim(),
                assetType: 'TEAM',
                teamId: team.id,
                collectionId: collection?.id ?? null,
                mintAddress,
                metadataUri,
                basePrice: parsedBasePrice,
                currentPrice: priceAt(parsedBasePrice, parsedKFactor, 0),
                totalSupply: supply,
                circulating: 0,
                bondingCurveK: parsedKFactor,
            },
        });
        return res.status(201).json({
            message: 'Asset minted',
            asset,
            pricingConfig: {
                basePrice: parsedBasePrice,
                kFactor: parsedKFactor,
                volatilityPreset: parseVolatilityPreset(volatilityPreset),
            },
            mint: {
                mintAddress,
                treasuryPda,
                txSignature,
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to mint asset' });
    }
});
exchangeRouter.post('/admin/assets/mint/land', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { name, description, location, collectionId, totalSupply, basePrice, kFactor, bondingCurveK, volatilityPreset, metadataUri, imageBase64, } = req.body;
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ message: 'name is required' });
        }
        const supply = requirePositiveInt(totalSupply ?? 1);
        const parsedBasePrice = requirePositiveNumber(basePrice);
        const parsedKFactor = resolveCurveK({
            explicitK: kFactor,
            aliasK: bondingCurveK,
            preset: volatilityPreset,
            min: 0.001,
            max: 2,
        });
        if (!supply || !parsedBasePrice || !parsedKFactor) {
            return res.status(400).json({ message: 'totalSupply, basePrice and kFactor/bondingCurveK (or volatilityPreset) are required with valid limits' });
        }
        const collection = typeof collectionId === 'string' && collectionId.trim()
            ? await prisma.assetCollection.findUnique({ where: { id: collectionId.trim() } })
            : null;
        if (collectionId && !collection)
            return res.status(404).json({ message: 'Collection not found' });
        const mintOwner = process.env.ADMIN_MINT_WALLET ?? getPlatformSigner().publicKey.toBase58();
        const { mintAddress, treasuryPda, txSignature } = await mintAssetToken({
            ownerWallet: mintOwner,
            totalSupply: supply,
        });
        const resolvedMetadataUri = typeof metadataUri === 'string' && metadataUri.trim()
            ? metadataUri.trim()
            : await uploadLandMetadata({
                name: name.trim(),
                ...(typeof description === 'string' && description.trim() ? { description: description.trim() } : {}),
                ...(typeof location === 'string' && location.trim() ? { location: location.trim() } : {}),
                basePrice: parsedBasePrice,
                kFactor: parsedKFactor,
                imageBase64,
            });
        const asset = await prisma.asset.create({
            data: {
                name: name.trim(),
                assetType: 'LAND',
                teamId: null,
                collectionId: collection?.id ?? null,
                mintAddress,
                metadataUri: resolvedMetadataUri,
                basePrice: parsedBasePrice,
                currentPrice: priceAt(parsedBasePrice, parsedKFactor, 0),
                totalSupply: supply,
                circulating: 0,
                bondingCurveK: parsedKFactor,
            },
        });
        return res.status(201).json({
            message: 'LAND asset minted',
            asset,
            pricingConfig: {
                basePrice: parsedBasePrice,
                kFactor: parsedKFactor,
                volatilityPreset: parseVolatilityPreset(volatilityPreset),
            },
            metadataSource: typeof metadataUri === 'string' && metadataUri.trim() ? 'provided' : resolvedMetadataUri ? 'generated' : 'none',
            mint: {
                mintAddress,
                treasuryPda,
                txSignature,
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to mint LAND asset' });
    }
});
exchangeRouter.post('/admin/matches', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { teamAId, teamBId, tournament, startTime } = req.body;
        if (typeof teamAId !== 'string' || typeof teamBId !== 'string' || !teamAId.trim() || !teamBId.trim()) {
            return res.status(400).json({ message: 'teamAId and teamBId are required' });
        }
        if (teamAId === teamBId) {
            return res.status(400).json({ message: 'teamAId and teamBId must be different' });
        }
        const parsedStart = typeof startTime === 'string' ? new Date(startTime) : null;
        if (!parsedStart || Number.isNaN(parsedStart.getTime())) {
            return res.status(400).json({ message: 'startTime must be an ISO datetime' });
        }
        const [teamA, teamB] = await Promise.all([
            prisma.team.findUnique({ where: { id: teamAId.trim() } }),
            prisma.team.findUnique({ where: { id: teamBId.trim() } }),
        ]);
        if (!teamA || !teamB) {
            return res.status(404).json({ message: 'One or both teams not found' });
        }
        const match = await prisma.match.create({
            data: {
                teamAId: teamA.id,
                teamBId: teamB.id,
                tournament: typeof tournament === 'string' ? tournament.trim() : null,
                startTime: parsedStart,
                status: 'SCHEDULED',
            },
            include: {
                teamA: true,
                teamB: true,
            },
        });
        return res.status(201).json({ message: 'Match created', match });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to create match' });
    }
});
exchangeRouter.post('/admin/markets', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { matchId, basePrice, kFactor, volatilityPreset, initialLiquidity } = req.body;
        if (typeof matchId !== 'string' || !matchId.trim()) {
            return res.status(400).json({ message: 'matchId is required' });
        }
        const parsedBasePrice = requirePositiveNumber(basePrice);
        const parsedKFactor = resolveCurveK({
            explicitK: kFactor,
            preset: volatilityPreset,
            min: 0.001,
            max: 2,
        });
        const parsedLiquidity = requirePositiveNumber(initialLiquidity);
        if (!parsedBasePrice || !parsedKFactor || !parsedLiquidity) {
            return res.status(400).json({ message: 'basePrice, kFactor, initialLiquidity must be positive numbers' });
        }
        const match = await prisma.match.findUnique({ where: { id: matchId.trim() } });
        if (!match)
            return res.status(404).json({ message: 'Match not found' });
        const existing = await prisma.predictionMarket.findUnique({ where: { matchId: match.id } });
        if (existing) {
            return res.status(400).json({ message: 'Market already exists for this match' });
        }
        const createMarketSig = await sendMemoTransaction({ op: 'create_market', matchId: match.id });
        const market = await prisma.predictionMarket.create({
            data: {
                matchId: match.id,
                contractAddr: createMarketSig,
                liquidityPool: parsedLiquidity,
                supplyA: 0,
                supplyB: 0,
                basePrice: parsedBasePrice,
                curveK: parsedKFactor,
                status: 'OPEN',
            },
            include: {
                match: {
                    include: {
                        teamA: true,
                        teamB: true,
                    },
                },
            },
        });
        return res.status(201).json({
            message: 'Market created',
            marketModel: 'AMM_POOL',
            pricingConfig: {
                basePrice: parsedBasePrice,
                kFactor: parsedKFactor,
                volatilityPreset: parseVolatilityPreset(volatilityPreset),
            },
            contractCall: {
                method: 'create_market',
                txSignature: createMarketSig,
            },
            market,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to create market' });
    }
});
exchangeRouter.post('/admin/markets/liquidity', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { marketId, amount } = req.body;
        if (typeof marketId !== 'string' || !marketId.trim()) {
            return res.status(400).json({ message: 'marketId is required' });
        }
        const parsedAmount = requirePositiveNumber(amount);
        if (!parsedAmount) {
            return res.status(400).json({ message: 'amount must be a positive number' });
        }
        const market = await prisma.predictionMarket.update({
            where: { id: marketId.trim() },
            data: {
                liquidityPool: { increment: parsedAmount },
            },
        });
        const addLiquiditySig = await sendMemoTransaction({ op: 'add_liquidity', marketId: market.id, amount: parsedAmount });
        return res.json({
            message: 'Liquidity added',
            contractCall: {
                method: 'add_liquidity',
                txSignature: addLiquiditySig,
            },
            market,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to add liquidity' });
    }
});
exchangeRouter.post('/admin/matches/result', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { matchId, winner } = req.body;
        if (typeof matchId !== 'string' || !matchId.trim()) {
            return res.status(400).json({ message: 'matchId is required' });
        }
        if (winner !== 'TEAM_A' && winner !== 'TEAM_B') {
            return res.status(400).json({ message: 'winner must be TEAM_A or TEAM_B' });
        }
        const { updatedMatch, setResultSig } = await prisma.$transaction(async (tx) => {
            const match = await tx.match.update({
                where: { id: matchId.trim() },
                data: {
                    result: winner,
                    status: 'FINISHED',
                },
            });
            await tx.predictionMarket.updateMany({
                where: { matchId: match.id },
                data: { status: 'SETTLED' },
            });
            const sig = await sendMemoTransaction({ op: 'set_result', matchId: match.id, result: winner });
            return { updatedMatch: match, setResultSig: sig };
        }, { timeout: 30000 });
        return res.json({
            message: 'Match result set',
            contractCall: {
                method: 'set_result',
                txSignature: setResultSig,
            },
            match: updatedMatch,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to set match result' });
    }
});
exchangeRouter.post('/admin/usdc/fund', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { walletAddress, amount } = req.body;
        const parsedWalletAddress = parseWalletAddress(walletAddress);
        const parsedAmount = requirePositiveNumber(amount);
        if (!parsedWalletAddress) {
            return res.status(400).json({ message: 'walletAddress must be a valid Solana public key' });
        }
        if (!parsedAmount) {
            return res.status(400).json({ message: 'amount must be a positive number' });
        }
        const funding = await fundUserUsdcWallet({
            walletAddress: parsedWalletAddress,
            amount: parsedAmount,
        });
        return res.status(201).json({
            message: 'Devnet USDC funded',
            mintAddress: getUsdcMint().toBase58(),
            decimals: USDC_DECIMALS,
            funding,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to fund devnet USDC' });
    }
});
exchangeRouter.get('/escrow/program-status', (req, res) => {
    const propertyId = typeof req.query.propertyId === 'string' ? req.query.propertyId.trim() : '';
    return res.json({
        escrowProgramId: ESCROW_PROGRAM_ID.toBase58(),
        isConfigured: ESCROW_PROGRAM_ID_RAW !== DEFAULT_ESCROW_PROGRAM_ID,
        ...(propertyId ? { propertyId, sampleEscrowPda: getEscrowPda(propertyId) } : {}),
    });
});
exchangeRouter.get('/teams', async (_req, res) => {
    try {
        const teams = await prisma.team.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return res.json({
            message: 'Teams fetched',
            data: teams,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch teams' });
    }
});
exchangeRouter.get('/assets', async (_req, res) => {
    try {
        const assets = await prisma.asset.findMany({
            include: {
                team: true,
                collection: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({
            message: 'Assets fetched',
            data: assets.map((asset) => ({
                ...asset,
                currentPrice: priceAt(asset.basePrice, asset.bondingCurveK, asset.circulating),
            })),
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch assets' });
    }
});
exchangeRouter.get('/assets/:assetId/owners', async (req, res) => {
    try {
        const assetId = typeof req.params.assetId === 'string' ? req.params.assetId.trim() : '';
        if (!assetId)
            return res.status(400).json({ message: 'assetId is required' });
        const asset = await prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset)
            return res.status(404).json({ message: 'Asset not found' });
        const holders = await prisma.userAsset.findMany({
            where: { assetId },
            include: {
                user: {
                    select: {
                        id: true,
                        walletAddress: true,
                        username: true,
                    },
                },
            },
            orderBy: [{ quantity: 'desc' }, { createdAt: 'asc' }],
        });
        const totalHeld = holders.reduce((sum, row) => sum + row.quantity, 0);
        return res.json(toJsonSafe({
            message: 'Asset owners fetched',
            asset: {
                id: asset.id,
                name: asset.name,
                assetType: asset.assetType,
                circulating: asset.circulating,
                totalSupply: asset.totalSupply,
            },
            holdersCount: holders.length,
            totalHeld,
            data: holders,
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch asset owners' });
    }
});
exchangeRouter.post('/assets/buy/prepare', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { assetId, quantity } = req.body;
        if (typeof assetId !== 'string' || !assetId.trim())
            return res.status(400).json({ message: 'assetId is required' });
        const parsedQuantity = requirePositiveInt(quantity);
        if (!parsedQuantity)
            return res.status(400).json({ message: 'quantity must be a positive integer' });
        const asset = await prisma.asset.findUnique({ where: { id: assetId.trim() } });
        if (!asset)
            return res.status(404).json({ message: 'Asset not found' });
        if (!asset.mintAddress)
            return res.status(400).json({ message: 'Asset not yet minted on-chain' });
        if ((asset.circulating + parsedQuantity) > asset.totalSupply) {
            return res.status(400).json({ message: 'Requested quantity exceeds remaining supply' });
        }
        const baseCost = buyCost(asset.basePrice, asset.bondingCurveK, asset.circulating, parsedQuantity);
        const fee = computeFeeBreakdown(baseCost);
        const totalCost = fee.grossAmount;
        const connection = getSolanaConnection();
        const payer = getPlatformSigner();
        const mint = new PublicKey(asset.mintAddress);
        const userWallet = new PublicKey(user.walletAddress);
        const treasuryATA = await getAssociatedTokenAddress(mint, payer.publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
        const userATA = await getAssociatedTokenAddress(mint, userWallet, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
        const totalCostLamports = quoteAmountToLamports(totalCost);
        const totalCostSol = quoteAmountToSol(totalCost);
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash });
        tx.add(SystemProgram.transfer({
            fromPubkey: userWallet,
            toPubkey: payer.publicKey,
            lamports: totalCostLamports,
        }));
        if (!(await connection.getAccountInfo(userATA))) {
            tx.add(createAssociatedTokenAccountInstruction(payer.publicKey, userATA, userWallet, mint, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID));
        }
        // Platform owns treasury ATA → platform signs the token transfer
        tx.add(createTransferInstruction(treasuryATA, userATA, payer.publicKey, parsedQuantity, [], TOKEN_PROGRAM_ID));
        // User signs this memo as proof of purchase
        tx.add(new TransactionInstruction({
            programId: MEMO_PROGRAM_ID,
            keys: [{ pubkey: userWallet, isSigner: true, isWritable: false }],
            data: Buffer.from(JSON.stringify({
                op: 'buy_asset',
                assetId: asset.id,
                quantity: parsedQuantity,
                baseCost,
                feeAmount: fee.feeAmount,
                totalCost,
            }), 'utf8'),
        }));
        tx.partialSign(payer);
        return res.json({
            unsignedTx: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
            preview: {
                assetId: asset.id,
                assetName: asset.name,
                quantity: parsedQuantity,
                baseCost,
                totalCost,
                feeBreakdown: {
                    feeBps: fee.feeBps,
                    feeAmount: fee.feeAmount,
                },
                settlementAsset: 'SOL',
                settlementAmountSol: totalCostSol,
                settlementLamports: totalCostLamports,
                currentPrice: priceAt(asset.basePrice, asset.bondingCurveK, asset.circulating),
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to prepare buy' });
    }
});
exchangeRouter.post('/assets/buy/confirm', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { txSignature, assetId, quantity } = req.body;
        if (typeof txSignature !== 'string' || !txSignature.trim())
            return res.status(400).json({ message: 'txSignature is required' });
        if (typeof assetId !== 'string' || !assetId.trim())
            return res.status(400).json({ message: 'assetId is required' });
        const parsedQuantity = requirePositiveInt(quantity);
        if (!parsedQuantity)
            return res.status(400).json({ message: 'quantity must be a positive integer' });
        const memo = await getConfirmedTxMemo(txSignature.trim());
        if (!memo)
            return res.status(400).json({ message: 'Transaction not found on-chain or missing memo. Ensure you broadcasted the exact unsignedTx from prepare on the same RPC cluster, then retry confirm after 2-5 seconds.' });
        if (memo.op !== 'buy_asset' || memo.assetId !== assetId.trim() || Number(memo.quantity) !== parsedQuantity) {
            return res.status(400).json({ message: 'Transaction memo does not match request parameters' });
        }
        const totalCost = typeof memo.totalCost === 'number' ? memo.totalCost : Number(memo.totalCost);
        const feeAmount = typeof memo.feeAmount === 'number' ? memo.feeAmount : Number(memo.feeAmount);
        const baseCost = typeof memo.baseCost === 'number' ? memo.baseCost : Number(memo.baseCost);
        const resolvedTotalCost = Number.isFinite(totalCost)
            ? totalCost
            : (typeof memo.cost === 'number' ? memo.cost : Number(memo.cost));
        const resolvedFeeAmount = Number.isFinite(feeAmount) ? feeAmount : computeFeeBreakdown(resolvedTotalCost).feeAmount;
        const resolvedBaseCost = Number.isFinite(baseCost) ? baseCost : Number((resolvedTotalCost - resolvedFeeAmount).toFixed(6));
        const existingTx = await prisma.transaction.findFirst({ where: { txSignature: txSignature.trim(), userId: user.id } });
        if (existingTx)
            return res.json({ message: 'Already confirmed', transaction: existingTx });
        const result = await prisma.$transaction(async (tx) => {
            const asset = await tx.asset.findUnique({ where: { id: assetId.trim() } });
            if (!asset)
                throw new Error('Asset not found');
            const nextCirculating = asset.circulating + parsedQuantity;
            const updatedAsset = await tx.asset.update({
                where: { id: asset.id },
                data: { circulating: nextCirculating, currentPrice: priceAt(asset.basePrice, asset.bondingCurveK, nextCirculating) },
            });
            const existingHolding = await tx.userAsset.findUnique({ where: { userId_assetId: { userId: user.id, assetId: asset.id } } });
            if (existingHolding) {
                const nextQty = existingHolding.quantity + parsedQuantity;
                const nextAvg = ((existingHolding.avgPrice * existingHolding.quantity) + resolvedTotalCost) / nextQty;
                await tx.userAsset.update({ where: { id: existingHolding.id }, data: { quantity: nextQty, avgPrice: nextAvg } });
            }
            else {
                await tx.userAsset.create({ data: { userId: user.id, assetId: asset.id, quantity: parsedQuantity, avgPrice: resolvedTotalCost / parsedQuantity } });
            }
            const transaction = await tx.transaction.create({
                data: { userId: user.id, txType: 'BUY_ASSET', assetId: asset.id, quantity: parsedQuantity, amountUsdc: resolvedTotalCost, txSignature: txSignature.trim() },
            });
            return { updatedAsset, totalCost: resolvedTotalCost, baseCost: resolvedBaseCost, feeAmount: resolvedFeeAmount, transaction };
        });
        return res.json({
            message: 'Asset buy confirmed',
            asset: result.updatedAsset,
            quantity: parsedQuantity,
            totalCost: result.totalCost,
            feeBreakdown: {
                feeBps: PLATFORM_FEE_BPS,
                feeAmount: result.feeAmount,
                baseCost: result.baseCost,
            },
            transaction: result.transaction,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to confirm buy' });
    }
});
exchangeRouter.post('/assets/sell/prepare', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { assetId, quantity } = req.body;
        if (typeof assetId !== 'string' || !assetId.trim())
            return res.status(400).json({ message: 'assetId is required' });
        const parsedQuantity = requirePositiveInt(quantity);
        if (!parsedQuantity)
            return res.status(400).json({ message: 'quantity must be a positive integer' });
        const asset = await prisma.asset.findUnique({ where: { id: assetId.trim() } });
        if (!asset)
            return res.status(404).json({ message: 'Asset not found' });
        if (!asset.mintAddress)
            return res.status(400).json({ message: 'Asset not yet minted on-chain' });
        const holding = await prisma.userAsset.findUnique({ where: { userId_assetId: { userId: user.id, assetId: asset.id } } });
        if (!holding || holding.quantity < parsedQuantity)
            return res.status(400).json({ message: 'Insufficient asset quantity' });
        const grossPayout = sellPayout(asset.basePrice, asset.bondingCurveK, asset.circulating, parsedQuantity);
        const fee = computeFeeBreakdown(grossPayout);
        const netPayout = fee.netAmount;
        const connection = getSolanaConnection();
        const payer = getPlatformSigner();
        const mint = new PublicKey(asset.mintAddress);
        const userWallet = new PublicKey(user.walletAddress);
        const treasuryATA = await getAssociatedTokenAddress(mint, payer.publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
        const userATA = await getAssociatedTokenAddress(mint, userWallet, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
        const netPayoutLamports = quoteAmountToLamports(netPayout);
        const netPayoutSol = quoteAmountToSol(netPayout);
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash });
        // User owns their ATA — Phantom must sign as token transfer authority
        tx.add(createTransferInstruction(userATA, treasuryATA, userWallet, parsedQuantity, [], TOKEN_PROGRAM_ID));
        tx.add(SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: userWallet,
            lamports: netPayoutLamports,
        }));
        tx.add(new TransactionInstruction({
            programId: MEMO_PROGRAM_ID,
            keys: [{ pubkey: userWallet, isSigner: true, isWritable: false }],
            data: Buffer.from(JSON.stringify({
                op: 'sell_asset',
                assetId: asset.id,
                quantity: parsedQuantity,
                grossPayout,
                feeAmount: fee.feeAmount,
                netPayout,
            }), 'utf8'),
        }));
        // Platform signs only as fee payer; user must sign as token transfer authority + memo
        tx.partialSign(payer);
        return res.json({
            unsignedTx: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
            preview: {
                assetId: asset.id,
                assetName: asset.name,
                quantity: parsedQuantity,
                grossPayout,
                netPayout,
                feeBreakdown: {
                    feeBps: fee.feeBps,
                    feeAmount: fee.feeAmount,
                },
                settlementAsset: 'SOL',
                settlementAmountSol: netPayoutSol,
                settlementLamports: netPayoutLamports,
                currentPrice: priceAt(asset.basePrice, asset.bondingCurveK, asset.circulating),
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to prepare sell' });
    }
});
exchangeRouter.post('/assets/sell/confirm', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { txSignature, assetId, quantity } = req.body;
        if (typeof txSignature !== 'string' || !txSignature.trim())
            return res.status(400).json({ message: 'txSignature is required' });
        if (typeof assetId !== 'string' || !assetId.trim())
            return res.status(400).json({ message: 'assetId is required' });
        const parsedQuantity = requirePositiveInt(quantity);
        if (!parsedQuantity)
            return res.status(400).json({ message: 'quantity must be a positive integer' });
        const memo = await getConfirmedTxMemo(txSignature.trim());
        if (!memo)
            return res.status(400).json({ message: 'Transaction not found on-chain or missing memo. Ensure you broadcasted the exact unsignedTx from prepare on the same RPC cluster, then retry confirm after 2-5 seconds.' });
        if (memo.op !== 'sell_asset' || memo.assetId !== assetId.trim() || Number(memo.quantity) !== parsedQuantity) {
            return res.status(400).json({ message: 'Transaction memo does not match request parameters' });
        }
        const netPayout = typeof memo.netPayout === 'number' ? memo.netPayout : Number(memo.netPayout);
        const feeAmount = typeof memo.feeAmount === 'number' ? memo.feeAmount : Number(memo.feeAmount);
        const grossPayout = typeof memo.grossPayout === 'number' ? memo.grossPayout : Number(memo.grossPayout);
        const resolvedNetPayout = Number.isFinite(netPayout)
            ? netPayout
            : (typeof memo.payout === 'number' ? memo.payout : Number(memo.payout));
        const resolvedFeeAmount = Number.isFinite(feeAmount) ? feeAmount : computeFeeBreakdown(resolvedNetPayout).feeAmount;
        const resolvedGrossPayout = Number.isFinite(grossPayout) ? grossPayout : Number((resolvedNetPayout + resolvedFeeAmount).toFixed(6));
        const existingTx = await prisma.transaction.findFirst({ where: { txSignature: txSignature.trim(), userId: user.id } });
        if (existingTx)
            return res.json({ message: 'Already confirmed', transaction: existingTx });
        const result = await prisma.$transaction(async (tx) => {
            const asset = await tx.asset.findUnique({ where: { id: assetId.trim() } });
            if (!asset)
                throw new Error('Asset not found');
            const holding = await tx.userAsset.findUnique({ where: { userId_assetId: { userId: user.id, assetId: asset.id } } });
            if (!holding || holding.quantity < parsedQuantity)
                throw new Error('Insufficient asset quantity');
            const nextCirculating = asset.circulating - parsedQuantity;
            const updatedAsset = await tx.asset.update({
                where: { id: asset.id },
                data: { circulating: nextCirculating, currentPrice: priceAt(asset.basePrice, asset.bondingCurveK, nextCirculating) },
            });
            const nextQty = holding.quantity - parsedQuantity;
            if (nextQty === 0) {
                await tx.userAsset.delete({ where: { id: holding.id } });
            }
            else {
                await tx.userAsset.update({ where: { id: holding.id }, data: { quantity: nextQty } });
            }
            const transaction = await tx.transaction.create({
                data: { userId: user.id, txType: 'SELL_ASSET', assetId: asset.id, quantity: parsedQuantity, amountUsdc: resolvedNetPayout, txSignature: txSignature.trim() },
            });
            return { updatedAsset, netPayout: resolvedNetPayout, grossPayout: resolvedGrossPayout, feeAmount: resolvedFeeAmount, transaction };
        });
        return res.json({
            message: 'Asset sell confirmed',
            asset: result.updatedAsset,
            quantity: parsedQuantity,
            totalPayout: result.netPayout,
            feeBreakdown: {
                feeBps: PLATFORM_FEE_BPS,
                feeAmount: result.feeAmount,
                grossPayout: result.grossPayout,
                netPayout: result.netPayout,
            },
            transaction: result.transaction,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to confirm sell' });
    }
});
exchangeRouter.get('/matches', async (_req, res) => {
    try {
        const matches = await prisma.match.findMany({
            include: {
                teamA: true,
                teamB: true,
            },
            orderBy: { startTime: 'asc' },
        });
        return res.json({
            message: 'Matches fetched',
            data: matches,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch matches' });
    }
});
exchangeRouter.get('/markets', async (_req, res) => {
    try {
        const markets = await prisma.predictionMarket.findMany({
            include: {
                match: {
                    include: {
                        teamA: true,
                        teamB: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({
            message: 'Markets fetched',
            data: markets.map((market) => ({
                ...market,
                teamAPrice: marketSidePrice(market.basePrice, market.curveK, market.supplyA),
                teamBPrice: marketSidePrice(market.basePrice, market.curveK, market.supplyB),
            })),
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch markets' });
    }
});
exchangeRouter.get('/markets/:marketId/audit', async (req, res) => {
    try {
        const marketId = typeof req.params.marketId === 'string' ? req.params.marketId.trim() : '';
        if (!marketId)
            return res.status(400).json({ message: 'marketId is required' });
        const market = await prisma.predictionMarket.findUnique({
            where: { id: marketId },
            include: {
                match: {
                    include: {
                        teamA: true,
                        teamB: true,
                    },
                },
            },
        });
        if (!market)
            return res.status(404).json({ message: 'Market not found' });
        const recentTrades = await prisma.transaction.findMany({
            where: {
                marketId: market.id,
                txType: {
                    in: ['BUY_PREDICTION', 'SELL_PREDICTION', 'CLAIM_REWARD'],
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        walletAddress: true,
                        username: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 25,
        });
        const settlementTx = market.status === 'SETTLED'
            ? await prisma.transaction.findFirst({
                where: {
                    marketId: market.id,
                    txType: 'CLAIM_REWARD',
                },
                orderBy: { createdAt: 'asc' },
            })
            : null;
        return res.json(toJsonSafe({
            message: 'Market audit fetched',
            marketModel: 'AMM_POOL_P2P',
            feeModel: {
                feeBps: PLATFORM_FEE_BPS,
            },
            market: {
                ...market,
                teamAPrice: marketSidePrice(market.basePrice, market.curveK, market.supplyA),
                teamBPrice: marketSidePrice(market.basePrice, market.curveK, market.supplyB),
            },
            transparency: {
                poolLiquidity: market.liquidityPool,
                supplyA: market.supplyA,
                supplyB: market.supplyB,
                recentTradesCount: recentTrades.length,
            },
            settlement: settlementTx,
            recentTrades,
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch market audit' });
    }
});
exchangeRouter.post('/markets/buy/prepare', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { marketId, side, quantity } = req.body;
        if (typeof marketId !== 'string' || !marketId.trim())
            return res.status(400).json({ message: 'marketId is required' });
        if (side !== 'TEAM_A' && side !== 'TEAM_B')
            return res.status(400).json({ message: 'side must be TEAM_A or TEAM_B' });
        const parsedQuantity = requirePositiveInt(quantity);
        if (!parsedQuantity)
            return res.status(400).json({ message: 'quantity must be a positive integer' });
        const market = await prisma.predictionMarket.findUnique({
            where: { id: marketId.trim() },
            include: { match: { include: { teamA: true, teamB: true } } },
        });
        if (!market)
            return res.status(404).json({ message: 'Market not found' });
        if (market.status !== 'OPEN')
            return res.status(400).json({ message: 'Market is not open' });
        const sideSupply = side === 'TEAM_A' ? market.supplyA : market.supplyB;
        const baseCost = marketBuyCost(market.basePrice, market.curveK, sideSupply, parsedQuantity);
        const fee = computeFeeBreakdown(baseCost);
        const totalCost = fee.grossAmount;
        const payer = getPlatformSigner();
        const connection = getSolanaConnection();
        const userWallet = new PublicKey(user.walletAddress);
        const totalCostLamports = quoteAmountToLamports(totalCost);
        const totalCostSol = quoteAmountToSol(totalCost);
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash });
        tx.add(SystemProgram.transfer({
            fromPubkey: userWallet,
            toPubkey: payer.publicKey,
            lamports: totalCostLamports,
        }));
        // Prediction positions are off-chain DB records; user signs a memo as proof of intent
        tx.add(new TransactionInstruction({
            programId: MEMO_PROGRAM_ID,
            keys: [{ pubkey: userWallet, isSigner: true, isWritable: false }],
            data: Buffer.from(JSON.stringify({
                op: 'buy_prediction',
                marketId: market.id,
                side,
                quantity: parsedQuantity,
                baseCost,
                feeAmount: fee.feeAmount,
                totalCost,
            }), 'utf8'),
        }));
        tx.partialSign(payer);
        return res.json({
            unsignedTx: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
            preview: {
                marketId: market.id,
                side,
                quantity: parsedQuantity,
                baseCost,
                totalCost,
                feeBreakdown: {
                    feeBps: fee.feeBps,
                    feeAmount: fee.feeAmount,
                },
                settlementAsset: 'SOL',
                settlementAmountSol: totalCostSol,
                settlementLamports: totalCostLamports,
                teamAName: market.match.teamA.name,
                teamBName: market.match.teamB.name,
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to prepare prediction buy' });
    }
});
exchangeRouter.post('/markets/buy/confirm', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { txSignature, marketId, side, quantity } = req.body;
        if (typeof txSignature !== 'string' || !txSignature.trim())
            return res.status(400).json({ message: 'txSignature is required' });
        if (typeof marketId !== 'string' || !marketId.trim())
            return res.status(400).json({ message: 'marketId is required' });
        if (side !== 'TEAM_A' && side !== 'TEAM_B')
            return res.status(400).json({ message: 'side must be TEAM_A or TEAM_B' });
        const parsedQuantity = requirePositiveInt(quantity);
        if (!parsedQuantity)
            return res.status(400).json({ message: 'quantity must be a positive integer' });
        const memo = await getConfirmedTxMemo(txSignature.trim());
        if (!memo)
            return res.status(400).json({ message: 'Transaction not found on-chain or missing memo. Ensure you broadcasted the exact unsignedTx from prepare on the same RPC cluster, then retry confirm after 2-5 seconds.' });
        if (memo.op !== 'buy_prediction' || memo.marketId !== marketId.trim() || memo.side !== side || Number(memo.quantity) !== parsedQuantity) {
            return res.status(400).json({ message: 'Transaction memo does not match request parameters' });
        }
        const totalCost = typeof memo.totalCost === 'number' ? memo.totalCost : Number(memo.totalCost);
        const feeAmount = typeof memo.feeAmount === 'number' ? memo.feeAmount : Number(memo.feeAmount);
        const baseCost = typeof memo.baseCost === 'number' ? memo.baseCost : Number(memo.baseCost);
        const resolvedTotalCost = Number.isFinite(totalCost)
            ? totalCost
            : (typeof memo.cost === 'number' ? memo.cost : Number(memo.cost));
        const resolvedFeeAmount = Number.isFinite(feeAmount) ? feeAmount : computeFeeBreakdown(resolvedTotalCost).feeAmount;
        const resolvedBaseCost = Number.isFinite(baseCost) ? baseCost : Number((resolvedTotalCost - resolvedFeeAmount).toFixed(6));
        const existingTx = await prisma.transaction.findFirst({ where: { txSignature: txSignature.trim(), userId: user.id } });
        if (existingTx)
            return res.json({ message: 'Already confirmed', transaction: existingTx });
        const result = await prisma.$transaction(async (tx) => {
            const market = await tx.predictionMarket.findUnique({ where: { id: marketId.trim() }, include: { match: true } });
            if (!market)
                throw new Error('Market not found');
            if (market.status !== 'OPEN')
                throw new Error('Market is not open');
            const updatedMarket = await tx.predictionMarket.update({
                where: { id: market.id },
                data: side === 'TEAM_A'
                    ? { supplyA: { increment: parsedQuantity }, liquidityPool: { increment: resolvedBaseCost } }
                    : { supplyB: { increment: parsedQuantity }, liquidityPool: { increment: resolvedBaseCost } },
            });
            const existing = await tx.predictionPosition.findFirst({ where: { userId: user.id, marketId: market.id, team: side } });
            if (existing) {
                const nextAmount = existing.amount + parsedQuantity;
                const nextAvg = ((existing.avgPrice * existing.amount) + resolvedTotalCost) / nextAmount;
                await tx.predictionPosition.update({ where: { id: existing.id }, data: { amount: nextAmount, avgPrice: nextAvg } });
            }
            else {
                await tx.predictionPosition.create({
                    data: { userId: user.id, marketId: market.id, team: side, amount: parsedQuantity, avgPrice: resolvedTotalCost / parsedQuantity },
                });
            }
            const transaction = await tx.transaction.create({
                data: { userId: user.id, txType: 'BUY_PREDICTION', marketId: market.id, quantity: parsedQuantity, amountUsdc: resolvedTotalCost, txSignature: txSignature.trim() },
            });
            return { updatedMarket, totalCost: resolvedTotalCost, baseCost: resolvedBaseCost, feeAmount: resolvedFeeAmount, transaction };
        });
        return res.json({
            message: 'Prediction buy confirmed',
            market: result.updatedMarket,
            quantity: parsedQuantity,
            totalCost: result.totalCost,
            feeBreakdown: {
                feeBps: PLATFORM_FEE_BPS,
                feeAmount: result.feeAmount,
                baseCost: result.baseCost,
            },
            transaction: result.transaction,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to confirm prediction buy' });
    }
});
exchangeRouter.post('/markets/sell/prepare', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { marketId, side, quantity } = req.body;
        if (typeof marketId !== 'string' || !marketId.trim())
            return res.status(400).json({ message: 'marketId is required' });
        if (side !== 'TEAM_A' && side !== 'TEAM_B')
            return res.status(400).json({ message: 'side must be TEAM_A or TEAM_B' });
        const parsedQuantity = requirePositiveInt(quantity);
        if (!parsedQuantity)
            return res.status(400).json({ message: 'quantity must be a positive integer' });
        const market = await prisma.predictionMarket.findUnique({
            where: { id: marketId.trim() },
            include: { match: { include: { teamA: true, teamB: true } } },
        });
        if (!market)
            return res.status(404).json({ message: 'Market not found' });
        if (market.status !== 'OPEN')
            return res.status(400).json({ message: 'Market is not open' });
        const position = await prisma.predictionPosition.findFirst({ where: { userId: user.id, marketId: market.id, team: side } });
        if (!position || position.amount < parsedQuantity)
            return res.status(400).json({ message: 'Insufficient prediction position' });
        const sideSupply = side === 'TEAM_A' ? market.supplyA : market.supplyB;
        const grossPayout = marketSellPayout(market.basePrice, market.curveK, sideSupply, parsedQuantity);
        const fee = computeFeeBreakdown(grossPayout);
        const netPayout = fee.netAmount;
        const payer = getPlatformSigner();
        const connection = getSolanaConnection();
        const userWallet = new PublicKey(user.walletAddress);
        const netPayoutLamports = quoteAmountToLamports(netPayout);
        const netPayoutSol = quoteAmountToSol(netPayout);
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash });
        tx.add(SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: userWallet,
            lamports: netPayoutLamports,
        }));
        tx.add(new TransactionInstruction({
            programId: MEMO_PROGRAM_ID,
            keys: [{ pubkey: userWallet, isSigner: true, isWritable: false }],
            data: Buffer.from(JSON.stringify({
                op: 'sell_prediction',
                marketId: market.id,
                side,
                quantity: parsedQuantity,
                grossPayout,
                feeAmount: fee.feeAmount,
                netPayout,
            }), 'utf8'),
        }));
        tx.partialSign(payer);
        return res.json({
            unsignedTx: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
            preview: {
                marketId: market.id,
                side,
                quantity: parsedQuantity,
                grossPayout,
                netPayout,
                feeBreakdown: {
                    feeBps: fee.feeBps,
                    feeAmount: fee.feeAmount,
                },
                settlementAsset: 'SOL',
                settlementAmountSol: netPayoutSol,
                settlementLamports: netPayoutLamports,
                teamAName: market.match.teamA.name,
                teamBName: market.match.teamB.name,
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to prepare prediction sell' });
    }
});
exchangeRouter.post('/markets/sell/confirm', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { txSignature, marketId, side, quantity } = req.body;
        if (typeof txSignature !== 'string' || !txSignature.trim())
            return res.status(400).json({ message: 'txSignature is required' });
        if (typeof marketId !== 'string' || !marketId.trim())
            return res.status(400).json({ message: 'marketId is required' });
        if (side !== 'TEAM_A' && side !== 'TEAM_B')
            return res.status(400).json({ message: 'side must be TEAM_A or TEAM_B' });
        const parsedQuantity = requirePositiveInt(quantity);
        if (!parsedQuantity)
            return res.status(400).json({ message: 'quantity must be a positive integer' });
        const memo = await getConfirmedTxMemo(txSignature.trim());
        if (!memo)
            return res.status(400).json({ message: 'Transaction not found on-chain or missing memo. Ensure you broadcasted the exact unsignedTx from prepare on the same RPC cluster, then retry confirm after 2-5 seconds.' });
        if (memo.op !== 'sell_prediction' || memo.marketId !== marketId.trim() || memo.side !== side || Number(memo.quantity) !== parsedQuantity) {
            return res.status(400).json({ message: 'Transaction memo does not match request parameters' });
        }
        const netPayout = typeof memo.netPayout === 'number' ? memo.netPayout : Number(memo.netPayout);
        const feeAmount = typeof memo.feeAmount === 'number' ? memo.feeAmount : Number(memo.feeAmount);
        const grossPayout = typeof memo.grossPayout === 'number' ? memo.grossPayout : Number(memo.grossPayout);
        const resolvedNetPayout = Number.isFinite(netPayout)
            ? netPayout
            : (typeof memo.payout === 'number' ? memo.payout : Number(memo.payout));
        const resolvedFeeAmount = Number.isFinite(feeAmount) ? feeAmount : computeFeeBreakdown(resolvedNetPayout).feeAmount;
        const resolvedGrossPayout = Number.isFinite(grossPayout) ? grossPayout : Number((resolvedNetPayout + resolvedFeeAmount).toFixed(6));
        const existingTx = await prisma.transaction.findFirst({ where: { txSignature: txSignature.trim(), userId: user.id } });
        if (existingTx)
            return res.json({ message: 'Already confirmed', transaction: existingTx });
        const result = await prisma.$transaction(async (tx) => {
            const market = await tx.predictionMarket.findUnique({ where: { id: marketId.trim() } });
            if (!market)
                throw new Error('Market not found');
            if (market.status !== 'OPEN')
                throw new Error('Market is not open');
            const position = await tx.predictionPosition.findFirst({ where: { userId: user.id, marketId: market.id, team: side } });
            if (!position || position.amount < parsedQuantity)
                throw new Error('Insufficient prediction position');
            const sideSupply = side === 'TEAM_A' ? market.supplyA : market.supplyB;
            if (sideSupply < parsedQuantity)
                throw new Error('Invalid market side supply state');
            if (market.liquidityPool < resolvedGrossPayout)
                throw new Error('Insufficient market liquidity');
            const updatedMarket = await tx.predictionMarket.update({
                where: { id: market.id },
                data: side === 'TEAM_A'
                    ? { supplyA: { decrement: parsedQuantity }, liquidityPool: { decrement: resolvedGrossPayout } }
                    : { supplyB: { decrement: parsedQuantity }, liquidityPool: { decrement: resolvedGrossPayout } },
            });
            const nextAmount = position.amount - parsedQuantity;
            if (nextAmount === 0) {
                await tx.predictionPosition.delete({ where: { id: position.id } });
            }
            else {
                await tx.predictionPosition.update({ where: { id: position.id }, data: { amount: nextAmount } });
            }
            const transaction = await tx.transaction.create({
                data: { userId: user.id, txType: 'SELL_PREDICTION', marketId: market.id, quantity: parsedQuantity, amountUsdc: resolvedNetPayout, txSignature: txSignature.trim() },
            });
            return { updatedMarket, netPayout: resolvedNetPayout, grossPayout: resolvedGrossPayout, feeAmount: resolvedFeeAmount, transaction };
        });
        return res.json({
            message: 'Prediction sell confirmed',
            market: result.updatedMarket,
            quantity: parsedQuantity,
            totalPayout: result.netPayout,
            feeBreakdown: {
                feeBps: PLATFORM_FEE_BPS,
                feeAmount: result.feeAmount,
                grossPayout: result.grossPayout,
                netPayout: result.netPayout,
            },
            transaction: result.transaction,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to confirm prediction sell' });
    }
});
exchangeRouter.post('/markets/claim/prepare', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { marketId } = req.body;
        if (typeof marketId !== 'string' || !marketId.trim())
            return res.status(400).json({ message: 'marketId is required' });
        const market = await prisma.predictionMarket.findUnique({
            where: { id: marketId.trim() },
            include: { match: { include: { teamA: true, teamB: true } } },
        });
        if (!market)
            return res.status(404).json({ message: 'Market not found' });
        if (market.status !== 'SETTLED')
            return res.status(400).json({ message: 'Market is not yet settled' });
        if (market.match.result !== 'TEAM_A' && market.match.result !== 'TEAM_B')
            return res.status(400).json({ message: 'Match result not available' });
        const alreadyClaimed = await prisma.transaction.findFirst({ where: { userId: user.id, marketId: market.id, txType: 'CLAIM_REWARD' } });
        if (alreadyClaimed)
            return res.status(400).json({ message: 'Rewards already claimed', transaction: alreadyClaimed });
        const winningSide = market.match.result;
        const winnerSupply = winningSide === 'TEAM_A' ? market.supplyA : market.supplyB;
        if (winnerSupply <= 0)
            return res.status(400).json({ message: 'No winning supply available' });
        const winningPositions = await prisma.predictionPosition.findMany({ where: { userId: user.id, marketId: market.id, team: winningSide } });
        const myWinningAmount = winningPositions.reduce((acc, p) => acc + p.amount, 0);
        if (myWinningAmount <= 0)
            return res.status(400).json({ message: 'No winning position to claim' });
        const grossPayout = (market.liquidityPool * myWinningAmount) / winnerSupply;
        const fee = computeFeeBreakdown(grossPayout);
        const netPayout = fee.netAmount;
        const payer = getPlatformSigner();
        const connection = getSolanaConnection();
        const userWallet = new PublicKey(user.walletAddress);
        const netPayoutLamports = quoteAmountToLamports(netPayout);
        const netPayoutSol = quoteAmountToSol(netPayout);
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash });
        tx.add(SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: userWallet,
            lamports: netPayoutLamports,
        }));
        tx.add(new TransactionInstruction({
            programId: MEMO_PROGRAM_ID,
            keys: [{ pubkey: userWallet, isSigner: true, isWritable: false }],
            data: Buffer.from(JSON.stringify({
                op: 'claim_reward',
                marketId: market.id,
                grossPayout,
                feeAmount: fee.feeAmount,
                netPayout,
                winningAmount: myWinningAmount,
            }), 'utf8'),
        }));
        tx.partialSign(payer);
        return res.json({
            unsignedTx: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
            preview: {
                marketId: market.id,
                winningSide,
                winningAmount: myWinningAmount,
                grossPayout,
                netPayout,
                feeBreakdown: {
                    feeBps: fee.feeBps,
                    feeAmount: fee.feeAmount,
                },
                settlementAsset: 'SOL',
                settlementAmountSol: netPayoutSol,
                settlementLamports: netPayoutLamports,
                teamAName: market.match.teamA.name,
                teamBName: market.match.teamB.name,
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to prepare claim' });
    }
});
exchangeRouter.post('/markets/claim/confirm', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { txSignature, marketId } = req.body;
        if (typeof txSignature !== 'string' || !txSignature.trim())
            return res.status(400).json({ message: 'txSignature is required' });
        if (typeof marketId !== 'string' || !marketId.trim())
            return res.status(400).json({ message: 'marketId is required' });
        const memo = await getConfirmedTxMemo(txSignature.trim());
        if (!memo)
            return res.status(400).json({ message: 'Transaction not found on-chain or missing memo. Ensure you broadcasted the exact unsignedTx from prepare on the same RPC cluster, then retry confirm after 2-5 seconds.' });
        if (memo.op !== 'claim_reward' || memo.marketId !== marketId.trim()) {
            return res.status(400).json({ message: 'Transaction memo does not match request parameters' });
        }
        const existingTx = await prisma.transaction.findFirst({ where: { txSignature: txSignature.trim(), userId: user.id } });
        if (existingTx)
            return res.json({ message: 'Already confirmed', transaction: existingTx });
        const result = await prisma.$transaction(async (tx) => {
            const market = await tx.predictionMarket.findUnique({ where: { id: marketId.trim() }, include: { match: true } });
            if (!market)
                throw new Error('Market not found');
            if (market.status !== 'SETTLED')
                throw new Error('Market is not settled');
            if (market.match.result !== 'TEAM_A' && market.match.result !== 'TEAM_B')
                throw new Error('Match result not available');
            const alreadyClaimed = await tx.transaction.findFirst({ where: { userId: user.id, marketId: market.id, txType: 'CLAIM_REWARD' } });
            if (alreadyClaimed) {
                return {
                    grossPayout: 0,
                    netPayout: 0,
                    feeAmount: 0,
                    transaction: alreadyClaimed,
                    alreadyClaimed: true,
                };
            }
            const winningSide = market.match.result;
            const winnerSupply = winningSide === 'TEAM_A' ? market.supplyA : market.supplyB;
            if (winnerSupply <= 0)
                throw new Error('No winning supply available');
            const myWinningPositions = await tx.predictionPosition.findMany({ where: { userId: user.id, marketId: market.id, team: winningSide } });
            const myWinningAmount = myWinningPositions.reduce((acc, p) => acc + p.amount, 0);
            if (myWinningAmount <= 0)
                throw new Error('No winning position to claim');
            const grossPayout = (market.liquidityPool * myWinningAmount) / winnerSupply;
            const fee = computeFeeBreakdown(grossPayout);
            const netPayout = fee.netAmount;
            for (const pos of myWinningPositions) {
                await tx.predictionPosition.update({ where: { id: pos.id }, data: { amount: 0 } });
            }
            const claimTx = await tx.transaction.create({
                data: { userId: user.id, txType: 'CLAIM_REWARD', marketId: market.id, amountUsdc: netPayout, quantity: myWinningAmount, txSignature: txSignature.trim() },
            });
            return {
                grossPayout,
                netPayout,
                feeAmount: fee.feeAmount,
                transaction: claimTx,
                alreadyClaimed: false,
            };
        });
        return res.json({
            message: result.alreadyClaimed ? 'Rewards already claimed' : 'Rewards claimed',
            payout: result.netPayout,
            feeBreakdown: result.alreadyClaimed
                ? null
                : {
                    feeBps: PLATFORM_FEE_BPS,
                    feeAmount: result.feeAmount,
                    grossPayout: result.grossPayout,
                    netPayout: result.netPayout,
                },
            transaction: result.transaction,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || 'Failed to confirm claim' });
    }
});
exchangeRouter.get('/admin/assets/:assetId/transactions', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const assetId = typeof req.params.assetId === 'string' ? req.params.assetId.trim() : '';
        if (!assetId) {
            return res.status(400).json({ message: 'assetId is required' });
        }
        const asset = await prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset)
            return res.status(404).json({ message: 'Asset not found' });
        const transactions = await prisma.transaction.findMany({
            where: {
                assetId,
                txType: {
                    in: ['BUY_ASSET', 'SELL_ASSET'],
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        walletAddress: true,
                        username: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(toJsonSafe({
            message: 'Asset transactions fetched',
            asset: {
                id: asset.id,
                name: asset.name,
                circulating: asset.circulating,
                totalSupply: asset.totalSupply,
                currentPrice: priceAt(asset.basePrice, asset.bondingCurveK, asset.circulating),
            },
            count: transactions.length,
            data: transactions,
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch asset transactions' });
    }
});
exchangeRouter.get('/admin/assets/:assetId/holders', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const assetId = typeof req.params.assetId === 'string' ? req.params.assetId.trim() : '';
        if (!assetId) {
            return res.status(400).json({ message: 'assetId is required' });
        }
        const asset = await prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset)
            return res.status(404).json({ message: 'Asset not found' });
        const holders = await prisma.userAsset.findMany({
            where: { assetId },
            include: {
                user: {
                    select: {
                        id: true,
                        walletAddress: true,
                        username: true,
                    },
                },
            },
            orderBy: [{ quantity: 'desc' }, { createdAt: 'asc' }],
        });
        const totalHeld = holders.reduce((sum, row) => sum + row.quantity, 0);
        return res.json(toJsonSafe({
            message: 'Asset holders fetched',
            asset: {
                id: asset.id,
                name: asset.name,
                circulating: asset.circulating,
                totalSupply: asset.totalSupply,
                currentPrice: priceAt(asset.basePrice, asset.bondingCurveK, asset.circulating),
            },
            holdersCount: holders.length,
            totalHeld,
            data: holders,
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch asset holders' });
    }
});
exchangeRouter.get('/admin/transactions', async (req, res) => {
    try {
        const authUser = await getUserFromAuthHeader(req.headers.authorization);
        const authWallet = authUser?.walletAddress;
        if (!isAdminRequest({ headers: req.headers }, authWallet)) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const rawTxType = typeof req.query.txType === 'string' ? req.query.txType.trim() : '';
        const validTxTypes = ['BUY_ASSET', 'SELL_ASSET', 'BUY_PREDICTION', 'SELL_PREDICTION', 'CLAIM_REWARD'];
        const txType = validTxTypes.includes(rawTxType)
            ? rawTxType
            : null;
        if (rawTxType && !txType) {
            return res.status(400).json({ message: 'Invalid txType' });
        }
        const transactions = await prisma.transaction.findMany({
            ...(txType ? { where: { txType } } : {}),
            include: {
                user: {
                    select: {
                        id: true,
                        walletAddress: true,
                        username: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(toJsonSafe({
            message: 'Transactions fetched',
            filter: { txType },
            count: transactions.length,
            data: transactions,
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch transactions' });
    }
});
exchangeRouter.get('/user/portfolio', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const holdings = await prisma.userAsset.findMany({
            where: { userId: user.id },
            include: {
                asset: {
                    include: {
                        team: { select: { id: true, name: true, logoUrl: true } },
                        collection: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        const items = holdings.map((h) => {
            const asset = h.asset;
            const currentPrice = priceAt(asset.basePrice, asset.bondingCurveK, asset.circulating);
            const currentValue = currentPrice * h.quantity;
            const costBasis = h.avgPrice * h.quantity;
            const unrealizedPnl = currentValue - costBasis;
            const unrealizedPnlPct = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;
            return {
                holdingId: h.id,
                asset: {
                    id: asset.id,
                    name: asset.name,
                    assetType: asset.assetType,
                    mintAddress: asset.mintAddress,
                    metadataUri: asset.metadataUri,
                    team: asset.team,
                    collection: asset.collection,
                },
                quantity: h.quantity,
                avgBuyPrice: h.avgPrice,
                currentPrice,
                currentValue,
                costBasis,
                unrealizedPnl,
                unrealizedPnlPct: Number(unrealizedPnlPct.toFixed(2)),
                acquiredAt: h.createdAt,
            };
        });
        const totalValue = items.reduce((s, i) => s + i.currentValue, 0);
        const totalCost = items.reduce((s, i) => s + i.costBasis, 0);
        const totalPnl = totalValue - totalCost;
        return res.json(toJsonSafe({
            message: 'Portfolio fetched',
            summary: {
                totalHoldings: items.length,
                totalValue,
                totalCost,
                totalUnrealizedPnl: totalPnl,
                totalUnrealizedPnlPct: totalCost > 0 ? Number(((totalPnl / totalCost) * 100).toFixed(2)) : 0,
            },
            holdings: items,
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch portfolio' });
    }
});
exchangeRouter.get('/user/positions', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const positions = await prisma.predictionPosition.findMany({
            where: { userId: user.id },
            include: {
                market: {
                    include: {
                        match: {
                            include: {
                                teamA: { select: { id: true, name: true, logoUrl: true } },
                                teamB: { select: { id: true, name: true, logoUrl: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const items = positions.map((p) => {
            const market = p.market;
            const match = market.match;
            const sideSupply = p.team === 'TEAM_A' ? market.supplyA : market.supplyB;
            const currentPrice = marketSidePrice(market.basePrice, market.curveK, sideSupply);
            const currentValue = marketSellPayout(market.basePrice, market.curveK, sideSupply, p.amount);
            const costBasis = p.avgPrice * p.amount;
            const unrealizedPnl = currentValue - costBasis;
            const unrealizedPnlPct = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;
            return {
                positionId: p.id,
                market: {
                    id: market.id,
                    status: market.status,
                    match: {
                        id: match.id,
                        startTime: match.startTime,
                        result: match.result,
                        teamA: match.teamA,
                        teamB: match.teamB,
                    },
                },
                side: p.team,
                amount: p.amount,
                avgBuyPrice: p.avgPrice,
                currentPrice,
                currentValue,
                costBasis,
                unrealizedPnl,
                unrealizedPnlPct: Number(unrealizedPnlPct.toFixed(2)),
                openedAt: p.createdAt,
            };
        });
        return res.json(toJsonSafe({
            message: 'Positions fetched',
            totalPositions: items.length,
            positions: items,
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch positions' });
    }
});
exchangeRouter.get('/user/transactions', async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req.headers.authorization);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { limit, offset } = req.query;
        const take = Math.min(100, Math.max(1, parseInt(limit ?? '20', 10) || 20));
        const skip = Math.max(0, parseInt(offset ?? '0', 10) || 0);
        const [txs, total] = await Promise.all([
            prisma.transaction.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take,
                skip,
            }),
            prisma.transaction.count({ where: { userId: user.id } }),
        ]);
        return res.json(toJsonSafe({
            message: 'Transactions fetched',
            pagination: { total, limit: take, offset: skip },
            transactions: txs,
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch transactions' });
    }
});
// ─────────────────────────────────────────────────────────────────────────────
exchangeRouter.get('/debug/exchange-state', async (_req, res) => {
    try {
        const [teams, assets, matches, markets] = await Promise.all([
            prisma.team.count(),
            prisma.asset.count(),
            prisma.match.count(),
            prisma.predictionMarket.count(),
        ]);
        return res.json(toJsonSafe({ teams, assets, matches, markets }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to load debug state' });
    }
});
export default exchangeRouter;
//# sourceMappingURL=exchange.route.js.map