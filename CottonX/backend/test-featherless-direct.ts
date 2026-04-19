import 'dotenv/config';
import OpenAI from 'openai';

async function testFeatherlessDirect() {
    console.log('🧪 Testing Featherless API directly...\n');

    const apiKey = process.env.FEATHERLESS_API_KEY;
    console.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : '❌ Missing'}\n`);

    if (!apiKey) {
        console.error('❌ FEATHERLESS_API_KEY not found!');
        process.exit(1);
    }

    try {
        const client = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://api.featherless.ai/v1',
        });

        console.log('📝 Making test request to Featherless...');
        
        const response = await client.chat.completions.create({
            model: 'deepseek-ai/DeepSeek-V3-0324',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say "Hello from Featherless!" and nothing else.' },
            ],
            max_tokens: 50,
        });

        console.log('\n✅ Success!');
        console.log(`   Response: ${response.choices[0]?.message?.content}`);
        console.log(`   Model: ${response.model}`);
        console.log('\n🎉 Featherless API is working!');

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        if (error.status) {
            console.error(`   Status: ${error.status}`);
        }
        if (error.response?.data) {
            console.error('   Details:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

testFeatherlessDirect();
