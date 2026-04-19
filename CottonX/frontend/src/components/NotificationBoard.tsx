import { pixelify_sans } from '@/app/fonts';
import { useEffect } from 'react';
import { formatEther } from 'viem';
import { useSendTransaction } from 'wagmi';
import Notification from './Notification';

interface NotificationBoardProps {
    notifications: any[];
}

const NotificationBoard = ({ notifications }: NotificationBoardProps) => {
    const { sendTransaction } = useSendTransaction();

    useEffect(() => {
        const recentFundRequests = notifications
            ?.map(notification => {
                const data = JSON.parse(notification.message);
                return {
                    eventName: data.eventName,
                    timestamp: new Date(data.createdAt),
                    metadata: data.metadata
                };
            })
            .filter(event =>
                event.eventName === 'funds_requested' &&
                (new Date().getTime() - event.timestamp.getTime()) < 15000
            );

        if (recentFundRequests && recentFundRequests.length > 0) {
            const request = recentFundRequests[0];
            sendTransaction({
                to: request.metadata.toAddress,
                value: request.metadata.requestedAmount
            });
        }
    }, [notifications, sendTransaction]);

    const formatMessage = (data: any): string => {
        const { eventName, characterId, metadata } = data;
        switch (eventName) {
            case 'wallet_created':
                return `${characterId}'s wallet was created at ${metadata?.address?.substring(0, 8)}...`;
            case 'funds_requested':
                return `${characterId} requested funds from ${metadata?.sender?.substring(0, 8)}...`;
            case 'tweet_sent':
                return `${characterId} successfully sent a tweet: "${metadata?.message?.substring(0, 50)}..."`;
            case 'image_created':
                return `${characterId} generated a new image for "${metadata?.prompt?.substring(0, 30)}..."`;
            case 'trade_executed':
                return `${characterId} executed a ${metadata?.action} for ${metadata?.amount} Wei`;
            case 'contract_deployed':
                return `${characterId} deployed contract "${metadata?.tokenName}" at ${metadata?.address?.substring(0, 8)}...`;
            case 'profile_synced':
                return `${characterId} synced their profile as "${metadata?.name}"`;
            case 'nft_minted':
                return `${characterId} minted NFT "${metadata?.name}"`;
            case 'transfer_sent':
                return `${characterId} transferred ${metadata?.amount} Wei to ${metadata?.to?.substring(0, 8)}...`;
            case 'analysis_complete':
                return `${characterId} completed analysis: ${metadata?.type || 'General'}`;
            case 'uniswap_pool_created':
                return `${characterId} created a liquidity pool for token ${metadata?.tokenAddress?.substring(0, 8)}...`;
            case 'get_wallet_data':
                return `${characterId} checked wallet details.`;
            case 'get_eth_balance':
                return `${characterId} checked HELA balance.`;
            case 'get_token_balance':
                return `${characterId} checked token balance for ${metadata?.tokenAddress?.substring(0, 8)}...`;
            case 'transfer_token_sent':
                return `${characterId} sent ${metadata?.amount} tokens to ${metadata?.to?.substring(0, 8)}...`;
            default:
                return `System event: ${eventName}`;
        }
    };

    return (
        <div className="w-full h-full max-h-screen flex flex-col bg-card p-4 overflow-hidden border-l rounded-lg">
            <h2 className={`font-semibold tracking-tight text-2xl text-blue-900 mb-4 ${pixelify_sans.className}`}>
                System Events
            </h2>
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                    {notifications?.map((notification) => {
                        const parsedData = JSON.parse(notification.message);
                        return (
                            <Notification
                                key={notification.id}
                                characterName={parsedData.characterId}
                                timestamp={new Date(parsedData.createdAt)}
                                message={formatMessage(parsedData)}
                                eventName={parsedData.eventName}
                                metadata={parsedData.metadata}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default NotificationBoard;
