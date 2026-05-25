import 'dotenv/config';
import axios from 'axios';

async function testZernio() {
    console.log('🚀 Testing Zernio API Integration...\n');

    const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY;

    if (!ZERNIO_API_KEY) {
        console.error('❌ ZERNIO_API_KEY not found in .env file');
        process.exit(1);
    }

    console.log('✅ Zernio API key found\n');

    try {
        // Step 1: Get connected accounts
        console.log('📋 Fetching your connected social media accounts...');
        const accountsResponse = await axios({
            url: 'https://zernio.com/api/v1/accounts',
            method: 'get',
            headers: {
                'Authorization': `Bearer ${ZERNIO_API_KEY}`,
            },
        });

        const accounts = accountsResponse.data;
        console.log('✅ Connected accounts:', JSON.stringify(accounts, null, 2));

        // Find Twitter/X account
        const twitterAccount = accounts.accounts?.find((acc: any) => 
            acc.platform === 'twitter' || acc.platform === 'x'
        );

        if (!twitterAccount) {
            console.log('\n⚠️  No Twitter/X account connected to Zernio');
            console.log('📋 Please follow these steps:');
            console.log('   1. Go to https://zernio.com/dashboard');
            console.log('   2. Click "Connect Account" or "Add Platform"');
            console.log('   3. Select Twitter/X and authorize the connection');
            console.log('   4. Come back and run this test again\n');
            process.exit(1);
        }

        console.log(`\n✅ Twitter/X account found: @${twitterAccount.username || twitterAccount.displayName}`);
        console.log(`   Account ID: ${twitterAccount._id}\n`);

        // Update .env instruction
        console.log('📝 Add this to your .env file:');
        console.log(`   ZERNIO_X_ACCOUNT_ID=${twitterAccount._id}\n`);

        // Step 2: Test posting a tweet
        if (process.env.ZERNIO_X_ACCOUNT_ID) {
            console.log('🐦 Testing tweet posting...');
            const testMessage = `🤖 CottonX AI Agent Test via Zernio - ${new Date().toLocaleString()}`;
            
            const postResponse = await axios({
                url: 'https://zernio.com/api/v1/posts',
                method: 'post',
                headers: {
                    'Authorization': `Bearer ${ZERNIO_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    content: testMessage,
                    platforms: [
                        { 
                            platform: 'twitter', 
                            accountId: process.env.ZERNIO_X_ACCOUNT_ID 
                        }
                    ],
                    publishNow: true,
                },
            });

            console.log('✅ Tweet posted successfully!');
            console.log('   Response:', JSON.stringify(postResponse.data, null, 2));
            console.log('\n🎉 Zernio integration is working perfectly!');
        } else {
            console.log('⏭️  Skipping tweet test (ZERNIO_X_ACCOUNT_ID not set)');
            console.log('   Add the Account ID above to your .env and run again to test posting\n');
        }

    } catch (error: any) {
        console.error('\n❌ Zernio API Error:', error.message);
        if (error.response?.data) {
            console.error('   Details:', JSON.stringify(error.response.data, null, 2));
        }
        
        if (error.response?.status === 401) {
            console.log('\n💡 Your API key might be invalid or expired.');
            console.log('   Get a new one from: https://zernio.com/dashboard/api-keys');
        }
        
        process.exit(1);
    }
}

testZernio();
