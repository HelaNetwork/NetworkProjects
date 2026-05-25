import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';

async function testTwitter() {
    console.log('🐦 Testing Twitter API connection...\n');

    // Check if credentials are set
    const requiredVars = [
        'TWITTER_APP_KEY',
        'TWITTER_APP_SECRET', 
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_SECRET'
    ];

    const missing = requiredVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
        console.error('❌ Missing environment variables:', missing.join(', '));
        process.exit(1);
    }

    console.log('✅ All Twitter credentials found in .env\n');

    try {
        const client = new TwitterApi({
            appKey: process.env.TWITTER_APP_KEY!,
            appSecret: process.env.TWITTER_APP_SECRET!,
            accessToken: process.env.TWITTER_ACCESS_TOKEN!,
            accessSecret: process.env.TWITTER_ACCESS_SECRET!,
        });

        // Try v1.1 API first (more compatible with older apps)
        console.log('🔐 Testing authentication with Twitter API v1.1...');
        try {
            const verifyCredentials = await client.v1.verifyCredentials();
            console.log(`✅ Authenticated as: @${verifyCredentials.screen_name} (${verifyCredentials.name})\n`);

            // Post a test tweet using v1.1
            const testMessage = `🤖 CottonX AI Test ${Date.now()}`;
            console.log(`📝 Posting test tweet: "${testMessage}"`);
            
            const tweet = await client.v1.tweet(testMessage);
            
            console.log(`✅ Tweet posted successfully!`);
            console.log(`   Tweet ID: ${tweet.id_str}`);
            console.log(`   Tweet URL: https://twitter.com/${verifyCredentials.screen_name}/status/${tweet.id_str}\n`);

            console.log('🎉 Twitter integration is working perfectly with v1.1 API!');
            return;
        } catch (v1Error: any) {
            console.log(`⚠️  v1.1 API tweet failed: ${v1Error.message}`);
            if (v1Error.code === 403 || v1Error.code === 401) {
                console.log('   This usually means your app needs "Read and Write" permissions.');
                console.log('   Trying v2 API...\n');
            }
        }

        // Try v2 API
        console.log('🔐 Testing authentication with Twitter API v2...');
        const me = await client.v2.me();
        console.log(`✅ Authenticated as: @${me.data.username} (${me.data.name})\n`);

        // Post a test tweet
        const testMessage = `🤖 CottonX AI Agent Test - ${new Date().toLocaleString()}`;
        console.log(`📝 Posting test tweet: "${testMessage}"`);
        
        const { data } = await client.v2.tweet(testMessage);
        
        console.log(`✅ Tweet posted successfully!`);
        console.log(`   Tweet ID: ${data.id}`);
        console.log(`   Tweet URL: https://twitter.com/${me.data.username}/status/${data.id}\n`);

        console.log('🎉 Twitter integration is working perfectly!');
        
    } catch (error: any) {
        console.error('\n❌ Twitter API Error:', error.message);
        if (error.data) {
            console.error('   Details:', JSON.stringify(error.data, null, 2));
        }
        
        console.log('\n📋 SETUP INSTRUCTIONS:');
        console.log('   Your Twitter app needs to be attached to a Developer Project.');
        console.log('   Follow these steps:');
        console.log('   1. Go to https://developer.twitter.com/en/portal/dashboard');
        console.log('   2. Create a new Project (or use existing one)');
        console.log('   3. Add your App to the Project');
        console.log('   4. Make sure your App has "Read and Write" permissions');
        console.log('   5. Regenerate your Access Token & Secret after changing permissions');
        console.log('   6. Update your .env file with the new credentials\n');
        
        process.exit(1);
    }
}

testTwitter();
