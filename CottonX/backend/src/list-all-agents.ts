import 'dotenv/config';
import { getFirestore } from './gcp/firestore';

async function listAllAgentsDocs() {
    const db = getFirestore();
    console.log('🔍 Listing ALL documents in "agents" collection...');
    const snapshot = await db.collection('agents').get();
    
    if (snapshot.empty) {
        console.log('No documents found in "agents".');
    } else {
        console.log(`Found ${snapshot.size} documents:`);
        snapshot.docs.forEach(doc => {
            console.log(`ID: ${doc.id} => ${JSON.stringify(doc.data())}`);
        });
    }
    process.exit(0);
}

listAllAgentsDocs();
