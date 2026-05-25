import 'dotenv/config';
import { OpenAIClassifier } from './src/agents/openai-classifier';

async function testClassifier() {
    console.log('🧪 Testing OpenAI Classifier with Featherless...\n');

    console.log('Environment check:');
    console.log(`  LLM_PROVIDER: ${process.env.LLM_PROVIDER}`);
    console.log(`  FEATHERLESS_API_KEY: ${process.env.FEATHERLESS_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`  API_MODEL_ID: ${process.env.API_MODEL_ID}\n`);

    try {
        const classifier = new OpenAIClassifier({
            inferenceConfig: {
                maxTokens: 1000,
                temperature: 0,
                topP: 0.9,
            },
        });

        // Mock the system prompt that would be set by orchestrator
        (classifier as any).systemPrompt = `
You are a classifier that routes messages to the appropriate agent.

Available agents:
- Eric: Market analyst
- Yasmin: Marketing expert
- Harper: Trading expert
- Rishi: Web3 expert

Select the most appropriate agent based on the user's message.
`;

        // Mock the agents map
        (classifier as any).agents = new Map([
            ['eric', { name: 'Eric', id: 'eric' }],
            ['yasmin', { name: 'Yasmin', id: 'yasmin' }],
            ['harper', { name: 'Harper', id: 'harper' }],
            ['rishi', { name: 'Rishi', id: 'rishi' }],
        ]);

        console.log('📝 Testing classification...');
        const testMessage = 'Can you create a tweet about crypto?';
        
        const result = await classifier.processRequest(
            testMessage,
            [],
            {
                llmProvider: 'featherless',
                llmModelId: 'deepseek-ai/DeepSeek-V3-0324'
            }
        );

        console.log('\n✅ Classification successful!');
        console.log(`   Selected Agent: ${result.selectedAgent?.name || 'None'}`);
        console.log(`   Confidence: ${result.confidence}\n`);

        console.log('🎉 Classifier is working correctly with Featherless!');

    } catch (error: any) {
        console.error('\n❌ Classifier Error:', error.message);
        if (error.response?.data) {
            console.error('   Details:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('\n   Stack:', error.stack);
        process.exit(1);
    }
}

testClassifier();
