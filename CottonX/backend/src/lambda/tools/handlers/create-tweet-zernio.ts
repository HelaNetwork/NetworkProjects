import 'dotenv/config';
import axios from 'axios';
import { logConsole, sendGodMessage } from "../../../utils";
import { createItem, storeUserEvent } from "../../dynamo_v3";

const docClient: any = null;
const CORE_TABLE_NAME = process.env.CORE_TABLE_NAME as string;
const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY;
const ZERNIO_X_ACCOUNT_ID = process.env.ZERNIO_X_ACCOUNT_ID;

export async function createTweetZernio(message: string, sessionId: string, characterId: string, createdBy: string) {
    try {
        if (!ZERNIO_API_KEY) {
            throw new Error('ZERNIO_API_KEY is not configured in environment variables');
        }

        if (!ZERNIO_X_ACCOUNT_ID) {
            throw new Error('ZERNIO_X_ACCOUNT_ID is not configured. Please connect your X account in Zernio dashboard.');
        }

        logConsole.info(`Posting tweet via Zernio: "${message.substring(0, 50)}..."`);

        const response = await axios({
            url: 'https://zernio.com/api/v1/posts',
            method: 'post',
            headers: {
                'Authorization': `Bearer ${ZERNIO_API_KEY}`,
                'Content-Type': 'application/json',
            },
            data: {
                content: message,
                platforms: [
                    { 
                        platform: 'twitter', 
                        accountId: ZERNIO_X_ACCOUNT_ID 
                    }
                ],
                publishNow: true,
            },
        });

        const postData = response.data;
        logConsole.info('Zernio response:', JSON.stringify(postData));

        // Extract post ID from response
        const postId = postData.post?._id || postData.id || postData.data?.id;

        // Store event in Firestore
        const randomUUID = crypto.randomUUID();
        const eventData = {
            createdBy: createdBy,
            characterId: characterId,
            eventName: "Tweet Created",
            tweetText: message,
            ...(postId && { zernioPostId: postId }),
        };

        await storeUserEvent(createdBy, randomUUID, eventData);

        // Send god message
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
                    postId: postId,
                    status: postData.post?.status || postData.status || 'published',
                    tweetUrl: postData.post?.platforms?.[0]?.platformPostUrl
                }
            }
        );

        logConsole.info(`✅ Tweet posted successfully via Zernio`);

        return {
            message: 'Tweet successfully created via Zernio',
            tweet_data: {
                text: message,
                id: postId,
                status: postData.post?.status || postData.status || 'published',
                platform: 'twitter',
                url: postData.post?.platforms?.[0]?.platformPostUrl
            }
        };

    } catch (error: any) {
        logConsole.error('Zernio API Error:', error.response?.data || error.message);
        
        return {
            error: error.name || 'ZernioError',
            message: `Failed to post tweet via Zernio: ${error.response?.data?.message || error.message}`,
            details: error.response?.data
        };
    }
}
