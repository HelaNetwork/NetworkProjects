import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import { logConsole } from '../../../utils';

export interface TweetAnalysis {
    tweetId: string;
    authorUsername: string;
    text: string;
    createdAt: string;
    metrics: {
        retweets: number;
        replies: number;
        likes: number;
        quotes: number;
    };
    mentionedUsers?: string[];
    urls?: string[];
}

let _twitterReadClient: TwitterApi | null = null;
function getTwitterReadClient(): TwitterApi {
    if (!_twitterReadClient) {
        _twitterReadClient = new TwitterApi({
            appKey: process.env.READ_TWITTER_ACCESS_APP_KEY as string,
            appSecret: process.env.READ_TWITTER_ACCESS_APP_SECRET as string,
            accessToken: process.env.READ_TWITTER_ACCESS_ACCESS_TOKEN as string,
            accessSecret: process.env.READ_TWITTER_ACCESS_ACCESS_SECRET as string,
        });
    }
    return _twitterReadClient;
}

interface TwitterUser {
    username: string;
    id: string;
}


async function getUsersByUsernames(usernames: string[]): Promise<TwitterUser[]> {
    try {
        const users = await getTwitterReadClient().v2.usersByUsernames(usernames, {
            "user.fields": ["username", "id"]
        });
        return users.data?.map(user => ({
            username: user.username,
            id: user.id
        })) || [];
    } catch (error) {
        console.error('Error fetching user IDs:', error);
        return [];
    }
}

async function fetchLatestTweet(userId: string): Promise<TweetAnalysis | null> {
    try {
        const tweets = await getTwitterReadClient().v2.userTimeline(userId, {
            "tweet.fields": ["created_at", "public_metrics", "entities"],
            "user.fields": ["username", "name"],
            max_results: 5,
        });

        if (!tweets.data?.data?.[0]) return null;

        const tweet = tweets.data.data[0];
        return {
            tweetId: tweet.id,
            authorUsername: tweet.author_id || '',
            text: tweet.text,
            createdAt: tweet.created_at || '',
            metrics: {
                retweets: tweet.public_metrics?.retweet_count || 0,
                replies: tweet.public_metrics?.reply_count || 0,
                likes: tweet.public_metrics?.like_count || 0,
                quotes: tweet.public_metrics?.quote_count || 0,
            },
            mentionedUsers: tweet.entities?.mentions?.map(mention => mention.username),
            urls: tweet.entities?.urls?.map(url => url.expanded_url),
        };
    } catch (error) {
        console.error('Error fetching tweet:', error);
        return null;
    }
}

export async function getTweets(specificXHandle: string) {
    try {
        let users: TwitterUser[];


        // If a specific handle is provided, look up just that user
        users = await getUsersByUsernames([specificXHandle]);
        if (users.length === 0) {
            return {
                error: 'UserNotFound',
                message: `Could not find Twitter user: ${specificXHandle}`
            };
        }


        const tweets: TweetAnalysis[] = [];

        for (const user of users) {
            const tweet = await fetchLatestTweet(user.id);
            if (tweet) {
                tweet.authorUsername = user.username;
                tweets.push(tweet);
            }
        }
        logConsole.info(JSON.stringify(tweets, null, 2));

        return {
            tweets,
            message: 'Successfully fetched tweets'
        };
    } catch (error: any) {
        console.error('Error fetching crypto tweets:', error);
        return {
            error: error.name || 'TwitterError',
            message: `Failed to fetch tweets: ${error.message}`
        };
    }
} 