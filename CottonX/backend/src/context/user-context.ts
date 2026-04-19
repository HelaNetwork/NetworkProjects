import 'dotenv/config';
import { logConsole } from '../utils';
import { createItem, getItem, updateItem } from '../lambda/dynamo_v3';

const CORE_TABLE_NAME = process.env.CORE_TABLE_NAME as string;
const docClient: any = null;

export interface UserProfile {
    userId: string;
    preferences: {
        defaultNetwork?: string;
        riskTolerance?: 'low' | 'medium' | 'high';
        notificationPreferences?: string[];
    };
    stats: {
        totalTrades?: number;
        totalDeployments?: number;
        totalTweets?: number;
        totalNFTs?: number;
        joinedAt?: string;
        lastActive?: string;
    };
    wallets: {
        [characterId: string]: string; // characterId -> wallet address
    };
}

export interface UserAction {
    actionId: string;
    userId: string;
    sessionId: string;
    agentName: string;
    actionType: 'tweet' | 'trade' | 'contract_deploy' | 'nft_mint' | 'wallet_create' | 'transfer';
    timestamp: string;
    outcome: 'success' | 'failed' | 'pending';
    details: any;
}

export class UserContextManager {
    /**
     * Get user profile
     */
    static async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const profile = await getItem<UserProfile>(
                `user_profile#${userId}`,
                'profile',
                CORE_TABLE_NAME,
                docClient
            );
            return profile;
        } catch (error) {
            logConsole.error('Error getting user profile:', error);
            return null;
        }
    }

    /**
     * Create or update user profile
     */
    static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
        try {
            const existing = await this.getUserProfile(userId);
            const profile: UserProfile = {
                userId,
                preferences: { ...existing?.preferences, ...updates.preferences },
                stats: { ...existing?.stats, ...updates.stats },
                wallets: { ...existing?.wallets, ...updates.wallets }
            };

            await createItem(
                `user_profile#${userId}`,
                'profile',
                profile,
                CORE_TABLE_NAME,
                docClient
            );

            logConsole.info(`Updated profile for user ${userId}`);
        } catch (error) {
            logConsole.error('Error updating user profile:', error);
        }
    }

    /**
     * Record user action
     */
    static async recordAction(action: Omit<UserAction, 'actionId' | 'timestamp'>): Promise<void> {
        try {
            const actionId = crypto.randomUUID();
            const userAction: UserAction = {
                actionId,
                timestamp: new Date().toISOString(),
                ...action
            };

            await createItem(
                `user_actions#${action.userId}`,
                `action#${actionId}`,
                userAction,
                CORE_TABLE_NAME,
                docClient
            );

            // Update stats
            const profile = await this.getUserProfile(action.userId);
            const stats = profile?.stats || {};
            
            if (action.actionType === 'trade') stats.totalTrades = (stats.totalTrades || 0) + 1;
            if (action.actionType === 'contract_deploy') stats.totalDeployments = (stats.totalDeployments || 0) + 1;
            if (action.actionType === 'tweet') stats.totalTweets = (stats.totalTweets || 0) + 1;
            if (action.actionType === 'nft_mint') stats.totalNFTs = (stats.totalNFTs || 0) + 1;
            
            stats.lastActive = new Date().toISOString();

            await this.updateUserProfile(action.userId, { stats });

            logConsole.info(`Recorded action ${action.actionType} for user ${action.userId}`);
        } catch (error) {
            logConsole.error('Error recording action:', error);
        }
    }

    /**
     * Get recent actions for a user
     */
    static async getRecentActions(userId: string, limit: number = 10): Promise<UserAction[]> {
        try {
            // In a real implementation, you'd query with a limit
            // For now, we'll just return empty array as placeholder
            logConsole.info(`Getting recent actions for user ${userId}`);
            return [];
        } catch (error) {
            logConsole.error('Error getting recent actions:', error);
            return [];
        }
    }

    /**
     * Build context string for agent conversations
     */
    static async buildContextString(userId: string): Promise<string> {
        try {
            const profile = await this.getUserProfile(userId);
            
            if (!profile) {
                return '';
            }

            const contextParts: string[] = [];

            // Add user stats
            if (profile.stats) {
                const stats = profile.stats;
                contextParts.push(`User Stats: ${stats.totalTrades || 0} trades, ${stats.totalDeployments || 0} contracts deployed, ${stats.totalTweets || 0} tweets, ${stats.totalNFTs || 0} NFTs minted`);
            }

            // Add wallet info
            if (profile.wallets && Object.keys(profile.wallets).length > 0) {
                const walletInfo = Object.entries(profile.wallets)
                    .map(([char, addr]) => `${char}: ${addr}`)
                    .join(', ');
                contextParts.push(`Wallets: ${walletInfo}`);
            }

            // Add preferences
            if (profile.preferences?.riskTolerance) {
                contextParts.push(`Risk Tolerance: ${profile.preferences.riskTolerance}`);
            }

            return contextParts.length > 0 
                ? `\n\n[User Context]\n${contextParts.join('\n')}\n`
                : '';
        } catch (error) {
            logConsole.error('Error building context string:', error);
            return '';
        }
    }

    /**
     * Register wallet for a character
     */
    static async registerWallet(userId: string, characterId: string, walletAddress: string): Promise<void> {
        try {
            const profile = await this.getUserProfile(userId);
            const wallets = profile?.wallets || {};
            wallets[characterId] = walletAddress;

            await this.updateUserProfile(userId, { wallets });
            logConsole.info(`Registered wallet ${walletAddress} for ${characterId}`);
        } catch (error) {
            logConsole.error('Error registering wallet:', error);
        }
    }
}
