import 'dotenv/config';

const sampleContract = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestToken {
    string public name = "Test";
    uint256 public totalSupply = 1000000;
}
`;

async function testUpload() {
    console.log('🧪 Testing upload endpoint...\n');
    
    try {
        const response = await fetch('http://localhost:8080/api/contracts/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: 'test_user_123',
                fileName: 'TestToken.sol',
                sourceCode: sampleContract,
                contractName: 'TestToken'
            })
        });

        console.log('Status:', response.status, response.statusText);
        
        const result = await response.json();
        console.log('\nResponse:', JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('\n✅ Upload successful!');
            console.log('File ID:', result.data.fileId);
        } else {
            console.log('\n❌ Upload failed:', result.error);
        }
    } catch (error: any) {
        console.error('\n❌ Network error:', error.message);
    }
}

testUpload();
