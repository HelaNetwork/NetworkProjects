import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import { logConsole, sendGodMessage } from "../../../utils";
import { createItem } from "../../dynamo_v3";

// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;
const CORE_TABLE_NAME = process.env.CORE_TABLE_NAME as string;

let _twitterClient: TwitterApi | null = null;
function getTwitterClient(): TwitterApi {
    if (!_twitterClient) {
        _twitterClient = new TwitterApi({
            appKey: process.env.TWITTER_APP_KEY as string,
            appSecret: process.env.TWITTER_APP_SECRET as string,
            accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
            accessSecret: process.env.TWITTER_ACCESS_SECRET as string,
        });
    }
    return _twitterClient;
}

export async function createTweet(message: string, sessionId: string, characterId: string, createdBy: string) {
    try {
        let tweetData;
        let tweetId;
        let tweetText;

        // Try v2 API first
        try {
            const result = await getTwitterClient().v2.tweet(message);
            tweetData = result.data;
            tweetId = result.data.id;
            tweetText = result.data.text;
        } catch (v2Error: any) {
            // Fallback to v1.1 API if v2 fails
            logConsole.warn('v2 API failed, falling back to v1.1:', v2Error.message);
            const result = await getTwitterClient().v1.tweet(message);
            tweetId = result.id_str;
            tweetText = result.text;
            tweetData = result;
        }

        const randomUUID = crypto.randomUUID();
        const eventData = {
            "createdBy": createdBy,
            "characterId": characterId,
            "eventName": "Tweet Created",
            "tweetText": message
        }
        logConsole.info('Creating event data in DynamoDB:', JSON.stringify(eventData));
        await createItem(
            "session#" + sessionId,
            "event#" + randomUUID,
            eventData,
            CORE_TABLE_NAME,
            docClient
        )

        // Send message using character message system
        await sendGodMessage(
            sessionId,
            docClient,
            {
                createdBy: createdBy,
                characterId: characterId,
                createdAt: new Date().toISOString(),
                eventName: "tweet_created",
                metadata: {
                    tweetText: message,
                    tweetId: tweetId
                }
            }
        );

        logConsole.info(`Tweeted: ${tweetText}`);
        return {
            message: 'Tweet successfully created',
            tweet_data: {
                text: tweetText,
                id: tweetId
            }
        };
    } catch (error: any) {
        logConsole.error('Failed to post tweet:', error);
        return {
            error: error.name || 'TweetError',
            message: `Failed to post tweet: ${error.message}. Please ensure your Twitter app is attached to a Developer Project with Read and Write permissions.`
        };
    }
}


