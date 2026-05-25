import 'dotenv/config';
import { createItem } from './lambda/dynamo_v3';
import { 
  MARKET_ANALYST_PROMPT, 
  TRADER_PROMPT, 
  ADMIN_PROMPT, 
  MARKETING_PROMPT 
} from './lambda/tools/persona';

const TABLE_NAME = 'agents'; // The collection name in Firestore shim

async function seed() {
    console.log('🌱 Seeding agents to Firestore...');

    const agents = [
        {
            name: 'Eric',
            character: 1,
            prompt: MARKET_ANALYST_PROMPT,
            skills: [],
            model: process.env.API_MODEL_ID || 'deepseek-ai/DeepSeek-V3-0324'
        },
        {
            name: 'Harper',
            character: 2,
            prompt: TRADER_PROMPT,
            skills: ['trading'],
            model: process.env.API_MODEL_ID || 'deepseek-ai/DeepSeek-V3-0324'
        },
        {
            name: 'Rishi',
            character: 3,
            prompt: ADMIN_PROMPT,
            skills: ['wallet'],
            model: process.env.API_MODEL_ID || 'deepseek-ai/DeepSeek-V3-0324'
        },
        {
            name: 'Yasmin',
            character: 4,
            prompt: MARKETING_PROMPT,
            skills: ['twitter'],
            model: process.env.API_MODEL_ID || 'deepseek-ai/DeepSeek-V3-0324'
        }
    ];

    for (const agent of agents) {
        const pk = `agent#${agent.name}`;
        const sk = 'metadata';
        const item = {
            ...agent,
            createdAt: new Date().toISOString(),
        };
        
        try {
            await createItem(pk, sk, item, TABLE_NAME, null);
            console.log(`✅ Seeded agent: ${agent.name}`);
        } catch (error) {
            console.error(`❌ Failed to seed agent ${agent.name}:`, error);
        }
    }

    console.log('✨ Seeding complete!');
    process.exit(0);
}

seed();
