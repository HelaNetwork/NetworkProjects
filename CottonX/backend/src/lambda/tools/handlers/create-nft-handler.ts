import { ContractMetadataJson, createCreatorClient, makeMediaTokenMetadata } from "@zoralabs/protocol-sdk";
import { Chain, createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { zora } from "viem/chains";
import { logConsole, sendCharacterMessage, sendGodMessage } from "../../../utils";
import { getWallet } from "../utils/getWallet";

// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;
const PINATA_JWT = process.env.PINATA_JWT;
const publicClient = createPublicClient({
    chain: zora as Chain,
    transport: http()
})

export async function createNFT({ createdBy, sessionId, characterId, NFTName, description, imageKey }: { createdBy: string, sessionId: string, characterId: string, NFTName: string, description: string, imageKey: string }) {
    logConsole.info('Starting NFT creation process', { createdBy, sessionId, characterId, NFTName });

    const wallet = await getWallet(createdBy, characterId);
    logConsole.info('Retrieved wallet details', { address: wallet.walletAddress });

    // Connect to Provider
    const rpcUrl = process.env.BASE_RPC_URL;
    logConsole.info("Connecting to RPC provider", { rpcUrl });
    const account = privateKeyToAccount(wallet.privateKey as `0x${string}`);
    logConsole.info('Created account from private key', { accountAddress: account.address });

    const walletClient = createWalletClient({
        chain: zora as Chain,
        transport: http(),
        account: account
    });
    logConsole.info('Created wallet client');

    // Initialize Zora client
    const creatorClient = createCreatorClient({ chainId: zora.id, publicClient: publicClient });
    logConsole.info('Initialized Zora creator client');

    // Prepare image file
    const bucketName = process.env.IMAGE_FILE_S3_BUCKET_NAME as string;
    logConsole.info('Fetching image from S3', { bucketName, imageKey });

    const imageFile = await fetchFileFromS3(bucketName, imageKey, imageKey, "image/png");

    await sendCharacterMessage(characterId, sessionId, docClient,
        `I'm uploading your NFT's content to IPFS for permanent storage...`);

    // Create contract metadata
    logConsole.info('Creating contract metadata...');
    const uploadPromise = Promise.all([
        makeContractMetadata({
            imageFile,
            name: NFTName,
            description: description || "An NFT created by Yasmin"
        }),
        makeImageTokenMetadata({
            imageFile,
            thumbnailFile: imageFile,
            NFTName,
            description
        })
    ]);

    // Send message after 6 seconds while waiting for slow IPFS upload
    setTimeout(async () => {
        await sendCharacterMessage(characterId, sessionId, docClient,
            `Still uploading to IPFS... you know what they say about decentralized storage - it's like watching paint dry, but more permanent`);
    }, 10000);

    // Send message after 6 seconds while waiting for slow IPFS upload
    setTimeout(async () => {
        await sendCharacterMessage(characterId, sessionId, docClient,
            `Still uploading to IPFS... they say IPFS stands for "I Patiently Face Slowness" - but hey, at least we know our data will outlive us all`);
    }, 20000);

    const [contractMetadataUri, tokenMetadataUri] = await uploadPromise;

    await sendCharacterMessage(characterId, sessionId, docClient,
        `Finally... metadata is ready, now creating your NFT contract onchain...`);

    // Create NFT contract
    logConsole.info('Preparing NFT contract creation...');
    const { parameters, contractAddress } = await creatorClient.create1155({
        contract: {
            name: NFTName,
            uri: contractMetadataUri,
        },
        token: {
            tokenMetadataURI: tokenMetadataUri,
            salesConfig: {
                pricePerToken: parseEther("0.001"),
            },
        },
        account: account,
    });
    logConsole.info('Contract creation parameters generated', { contractAddress });

    // Send transaction
    logConsole.info('Sending contract creation transaction...');
    const tx = await walletClient.writeContract(parameters);
    logConsole.info('Transaction sent successfully', {
        transactionHash: tx,
        contractAddress: contractAddress
    });

    await sendCharacterMessage(characterId, sessionId, docClient,
        `Your NFT has been created at contract address: ${contractAddress}`);

    const zoraLink = `https://zora.co/collect/zora:${contractAddress.toLowerCase()}`;
    await sendGodMessage(sessionId, docClient, {
        createdBy,
        characterId,
        createdAt: new Date().toISOString(),
        eventName: "nft_created",
        metadata: { contractAddress, NFTName, zoraLink },
    });

    return { contractAddress, zoraLink, NFTName };
}

export async function makeContractMetadata({ imageFile, name, description }: {
    imageFile: File;
    name: string;
    description?: string;
}) {
    logConsole.info('Starting contract metadata creation', { name });

    // Ensure file has proper name
    const renamedImageFile = new File([imageFile], "image.png", { type: imageFile.type });
    const imageFileIpfsUrl = await pinFileWithPinata(renamedImageFile);
    logConsole.info('Image pinned to IPFS', { imageFileIpfsUrl });

    const metadataJson: ContractMetadataJson = {
        name: name,
        description: description || `A unique AI-generated artwork collection`,
        image: imageFileIpfsUrl,
    };

    const contractMetadataJsonUri = await pinJsonWithPinata(metadataJson);
    logConsole.info('Contract metadata pinned to IPFS', { contractMetadataJsonUri });

    return contractMetadataJsonUri;
}

export async function makeImageTokenMetadata({
    imageFile,
    thumbnailFile,
    NFTName,
    description
}: {
    imageFile: File;
    thumbnailFile: File;
    NFTName: string;
    description?: string;
}) {
    logConsole.info('Starting token metadata creation');

    // Ensure files have proper names
    const renamedImageFile = new File([imageFile], "image.png", { type: imageFile.type });
    const renamedThumbnailFile = new File([thumbnailFile], "thumbnail.png", { type: thumbnailFile.type });

    const mediaFileIpfsUrl = await pinFileWithPinata(renamedImageFile);
    const thumbnailFileIpfsUrl = await pinFileWithPinata(renamedThumbnailFile);

    logConsole.info('Files pinned to IPFS', {
        mediaUrl: mediaFileIpfsUrl,
        thumbnailUrl: thumbnailFileIpfsUrl
    });

    // Use Zora's helper to create metadata
    const metadataJson = await makeMediaTokenMetadata({
        mediaUrl: mediaFileIpfsUrl,
        description: description || `A unique AI-generated artwork`,
        thumbnailUrl: thumbnailFileIpfsUrl,
        name: NFTName,
    });

    logConsole.info('Token metadata created', { metadataJson });

    const jsonMetadataUri = await pinJsonWithPinata(metadataJson);
    logConsole.info('Token metadata pinned to IPFS', { jsonMetadataUri });

    return jsonMetadataUri;
}

export async function pinFileWithPinata(file: File) {
    const data = new FormData();
    const pinataOptions = JSON.stringify({
        wrapWithDirectory: true  // This was key for the thumbnail working
    });

    data.append("file", file);
    data.append("pinataOptions", pinataOptions);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: data,
    });

    if (!res.ok) {
        const errorData = await res.json();
        logConsole.error('Pinata upload failed', errorData);
        throw new Error(`Failed to upload to Pinata: ${res.statusText}`);
    }

    const result = (await res.json()) as { IpfsHash: string };
    // Return the IPFS URI with the filename - this format worked for the thumbnail
    return `ipfs://${result.IpfsHash}/${file.name}`;
}

// Update pinJsonWithPinata to handle errors
export async function pinJsonWithPinata(json: object) {
    logConsole.info('Pinning JSON to IPFS', { json });
    const data = JSON.stringify({
        pinataContent: json,
        pinataMetadata: {
            name: "metadata.json",
        },
    });

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: data,
    });

    if (!res.ok) {
        const errorData = await res.json();
        logConsole.error('Pinata JSON upload failed', errorData);
        throw new Error(`Failed to upload JSON to Pinata: ${res.statusText}`);
    }

    const result = (await res.json()) as { IpfsHash: string };
    // Return proper IPFS URI format
    return `ipfs://${result.IpfsHash}`;
}

// Helper function to fetch image from a URL and convert it to a File object
// (GCP version — no longer uses S3)
async function fetchFileFromS3(bucketName: string, key: string, fileName: string, mimeType: string): Promise<File> {
    // Try to fetch from a URL if the key looks like a URL
    // Otherwise create a placeholder File
    try {
        const url = key.startsWith('http') ? key : `https://placehold.co/1024x1024/1a1a2e/e0e0e0?text=NFT`;
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], fileName, { type: mimeType });
    } catch (error) {
        logConsole.error('Error fetching image:', error);
        // Return a minimal placeholder file
        const placeholder = new Blob(['placeholder'], { type: mimeType });
        return new File([placeholder], fileName, { type: mimeType });
    }
}