import { truncateAddress } from '@/utils/formatters';
import { Name } from '@coinbase/onchainkit/identity';
import Image from 'next/image';
import { base } from 'wagmi/chains';

interface NotificationProps {
    message: string;
    timestamp: Date;
    characterName: string;
    eventName?: string;
    metadata?: Record<string, string>;
}

const Notification = ({ message, timestamp, characterName, eventName, metadata }: NotificationProps) => {
    const getEventTagClass = (event: string) => {
        switch (event) {
            case 'funds_requested':
                return 'bg-emerald-500 text-white';
            case 'trade_executed':
                return 'bg-blue-500 text-white';
            case 'contract_deployed':
                return 'bg-purple-500 text-white';
            case 'wallet_created':
                return 'bg-amber-500 text-white';
            case 'uniswap_pool_created':
                return 'bg-pink-500 text-white';
            case 'tweet_created':
                return 'bg-sky-500 text-white';
            case 'system':
                return 'bg-gray-500 text-white';
            case 'image_created':
                return 'bg-indigo-500 text-white';
            case 'basename_managed':
                return 'bg-blue-700 text-white';
            default:
                return 'bg-muted text-black';
        }
    };

    const getCharacterNameClass = (name: string) => {
        const lowerName = (name || '').toLowerCase();
        switch (lowerName) {
            case 'eric':
                return 'text-green-500';
            case 'harper':
                return 'text-purple-500';
            case 'rishi':
                return 'text-amber-500';
            case 'yasmin':
                return 'text-rose-500';
            default:
                return 'text-black';
        }
    };

    const getBackgroundClass = (name: string) => {
        const lowerName = (name || '').toLowerCase();
        switch (lowerName) {
            case 'eric':
                return 'bg-green-50';
            case 'harper':
                return 'bg-purple-50';
            case 'rishi':
                return 'bg-amber-50';
            case 'yasmin':
                return 'bg-rose-50';
            default:
                return 'bg-card';
        }
    };

    const getBorderClass = (name: string) => {
        const lowerName = (name || '').toLowerCase();
        switch (lowerName) {
            case 'eric':
                return 'border-green-100';
            case 'harper':
                return 'border-purple-100';
            case 'rishi':
                return 'border-amber-100';
            case 'yasmin':
                return 'border-rose-100';
            default:
                return 'border-gray-100';
        }
    };

    const renderMetadataValue = (key: string, value: string) => {
        if (key === 'walletAddress' || key === 'contractAddress' ||
            key === 'fromAddress' || key === 'toAddress' ||
            key === 'poolAddress' || key === 'tokenAddress') {
            return truncateAddress(value);
        }
        if (key === 'requestedAmount' || key === 'amount' || key === 'totalSupply') {
            return `${parseFloat(value) / 1e18} ETH`;
        }
        return value;
    };

    const getExternalLink = (eventName: string, metadata: Record<string, string>): string | null => {
        switch (eventName) {
            case 'contract_deployed':
                return `https://basescan.org/address/${metadata.contractAddress}`;
            case 'uniswap_pool_created':
                return `https://dexscreener.com/base/${metadata.poolAddress.toLowerCase()}`;
            case 'nft_created':
                return `https://zora.co/collect/zora:${metadata.contractAddress.toLowerCase()}`;
            case 'tweet_created':
                return `https://x.com/i/${metadata.tweetId}`;
            default:
                return null;
        }
    };

    return (
        <div
            className={`relative p-4 mb-2 rounded-lg shadow-sm ${getBackgroundClass(characterName)} ${getBorderClass(characterName)} border-2 ${['contract_deployed', 'uniswap_pool_created', 'nft_created'].includes(eventName || '') ? 'cursor-pointer hover:opacity-90' : ''
                } text-black`}
            onClick={() => {
                const link = metadata && eventName ? getExternalLink(eventName, metadata) : null;
                if (link) {
                    window.open(link, '_blank');
                }
            }}
        >
            <div className="flex flex-col gap-2 w-full">
                {/* Header row with timestamp */}
                <div className="flex items-start justify-between gap-2 w-full">
                    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                        <span className={`font-semibold truncate ${getCharacterNameClass(characterName)}`}>
                            {characterName}
                        </span>
                        {eventName && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getEventTagClass(eventName)} shrink-0`}>
                                {eventName.replace('_', ' ')}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-black shrink-0">
                        {timestamp.toLocaleTimeString()}
                    </span>
                </div>

                {/* Message */}
                <div className={`text-sm w-full text-black ${eventName === 'system' ? 'font-black' : ''}`}>
                    {message.split(/(?<=[.!?])\s+/).map((sentence, index) => (
                        <span key={index} className={index === 0 ? 'font-medium' : ''}>
                            {sentence}{' '}
                        </span>
                    ))}
                </div>

                {/* Metadata */}
                {metadata && (
                    <div className="mt-1 p-2 rounded-md bg-muted/50 text-xs font-mono w-full text-black">
                        {eventName === "image_created" && metadata.url && (
                            <Image
                                src={metadata.url}
                                unoptimized={true}
                                alt="Generated image"
                                width={250}
                                height={250}
                                className="rounded-md"
                            />
                        )}
                        {eventName === "basename_managed" && metadata.basename && (
                            <Name address={metadata.walletAddress as `0x${string}`} chain={base} />
                        )}
                        {eventName === "uniswap_pool_created" && (
                            <Image
                                src={"https://i.pinimg.com/originals/1d/cc/84/1dcc8458abdeee8e528d7996047d1000.jpg"}
                                unoptimized={true}
                                alt="Uniswap pool"
                                width={250}
                                height={250}
                                className="rounded-md"
                            />
                        )}
                        {eventName === "nft_created" && (
                            <Image
                                src={"https://avatars.githubusercontent.com/u/60056322?s=280&v=4"}
                                unoptimized={true}
                                alt="NFT"
                                width={250}
                                height={250}
                                className="rounded-md"
                            />
                        )}
                        {eventName === "contract_deployed" && (
                            <Image
                                src={"https://images.mirror-media.xyz/publication-images/cgqxxPdUFBDjgKna_dDir.png?height=1200&width=1200"}
                                unoptimized={true}
                                alt="Contract deployed"
                                width={250}
                                height={250}
                                className="rounded-md"
                            />
                        )}
                        <div className="grid grid-cols-1 gap-1">
                            {Object.entries(metadata).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <span className="text-black font-medium capitalize shrink-0">
                                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                    </span>
                                    <span className="text-black truncate">
                                        {renderMetadataValue(key, value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notification;