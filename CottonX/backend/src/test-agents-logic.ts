import WebSocket from 'ws';
import 'dotenv/config';

const PORT = process.env.PORT || '8080';
const sessionId = 'test-session-' + Date.now();
const characterId = 'god';

const wsUrl = `ws://localhost:${PORT}?sessionId=${sessionId}&characterId=${characterId}`;

async function testAgents() {
    console.log(`Connecting to ${wsUrl}...`);
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
        console.log('✅ Connected to CottonX Server');
        
        // Test 1: Yasmin (Marketing)
        console.log('\n--- Test 1: Yasmin (Marketing Task) ---');
        console.log('Sending: "Hey Yasmin, can you make a tweet saying HeLa is the future of blockchain?"');
        ws.send(JSON.stringify({
            action: 'sendMessage',
            data: 'Hey Yasmin, can you make a tweet saying HeLa is the future of blockchain?',
            createdBy: 'Reality',
            sessionId: sessionId,
            characterId: characterId
        }));
    });

    let messageCount = 0;
    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        console.log('\n📥 Received response from:', msg.characterId);
        console.log('Message:', msg.message);
        
        if (msg.message.includes('```json')) {
            console.log('✅ SUCCESS: Agent output a JSON execution block!');
        } else if (msg.message === '*Executing task...*') {
             console.log('✅ SUCCESS: Agent triggered tool execution!');
        }

        messageCount++;
        if (messageCount === 1) {
            // Test 2: Harper (Trading)
            console.log('\n--- Test 2: Harper (Trading Task) ---');
            console.log('Sending: "Hey Harper, check my balance and then swap 0.1 HELA for USDC"');
            ws.send(JSON.stringify({
                action: 'sendMessage',
                data: 'Hey Harper, check my balance and then swap 0.1 HELA for USDC',
                createdBy: 'Reality',
                sessionId: sessionId,
                characterId: characterId
            }));
        } else if (messageCount === 2) {
             console.log('\nTests completed. Closing connection...');
             ws.close();
             process.exit(0);
        }
    });

    ws.on('error', (err) => {
        console.error('❌ Connection error:', err);
    });

    ws.on('close', () => {
        console.log('Connection closed.');
    });

    // Timeout after 60 seconds
    setTimeout(() => {
        console.log('Test timed out.');
        process.exit(1);
    }, 60000);
}

testAgents();
