import 'dotenv/config';
import { scan } from './lambda/dynamo_v3';

async function listAgents() {
    console.log('🔍 Fetching agents from Firestore...');
    try {
        const agents = await scan('agents', {}, null);
        console.log(`Found ${agents.length} agents:`);
        agents.forEach((a: any) => {
            console.log(`- ${a.name} (Character: ${a.character}, Skills: ${a.skills.join(', ')})`);
        });
    } catch (error) {
        console.error('❌ Failed to fetch agents:', error);
    }
    process.exit(0);
}

listAgents();
