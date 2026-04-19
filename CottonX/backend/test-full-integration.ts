import 'dotenv/config';
import { createTweetZernio } from './src/lambda/tools/handlers/create-tweet-zernio';

async function testFullIntegration() {
    console.log('🚀 Testing Full Integration: Featherless + Zernio\n');

    console.log('Environment check:');
    console.log(`  LLM_PROVIDER: ${process.env.LLM_PROVIDER}`);
    console.log(`  FEATHERLESS_API_KEY: ${process.env.FEATHERLESS_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`  ZERNIO_API_KEY: ${process.env.ZERNIO_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`  ZERNIO_X_ACCOUNT_ID: ${process.env.ZERNIO_X_ACCOUNT_ID ? '✅ Set' : '❌ Missing'}\n`);

    try {
        console.log('🐦 Testing tweet creation via Zernio...');
        
        const testMessage = `🤖 CottonX AI Agent - Full Integration Test ${new Date().toLocaleTimeString()}`;
        
        const result = await createTweetZernio(
            testMessage,
            'test-session-123',
            'Yasmin',
            'test-user-123'
        );

        if (result.error) {
            console.error('\n❌ Tweet creation failed:', result.message);
            console.error('   Details:', result.details);
            process.exit(1);
        }

        console.log('\n✅ Tweet posted successfully!');
        console.log(`   Tweet ID: ${result.tweet_data?.id}`);
        console.log(`   Status: ${result.tweet_data?.status}`);
        console.log(`   Platform: ${result.tweet_data?.platform}`);
        
        console.log('\n🎉 Full integration is working!');
        console.log('   ✅ Featherless API: Working');
        console.log('   ✅ Zernio API: Working');
        console.log('   ✅ Tweet Posting: Working');
        console.log('\n🚀 Your AI agents are ready to post tweets!');

    } catch (error: any) {
        console.error('\n❌ Integration Error:', error.message);
        if (error.stack) {
            console.error('   Stack:', error.stack);
        }
        process.exit(1);
    }
}

testFullIntegration();
