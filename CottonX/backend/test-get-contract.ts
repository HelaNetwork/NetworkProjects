import 'dotenv/config';

async function testGetContract() {
    console.log('🧪 Testing get contract endpoint...\n');
    
    // First upload a contract
    const sampleContract = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestToken {
    string public name = "Test";
    uint256 public totalSupply = 1000000;
}
`;

    try {
        // Upload
        console.log('1️⃣ Uploading contract...');
        const uploadResponse = await fetch('http://localhost:8080/api/contracts/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'test_user_123',
                fileName: 'TestToken.sol',
                sourceCode: sampleContract,
                contractName: 'TestToken'
            })
        });

        const uploadResult = await uploadResponse.json();
        console.log('Upload result:', uploadResult);

        if (!uploadResult.success) {
            console.error('❌ Upload failed');
            return;
        }

        const fileId = uploadResult.data.fileId;
        console.log('✅ Uploaded with fileId:', fileId);

        // Get contract
        console.log('\n2️⃣ Fetching contract...');
        const getResponse = await fetch(`http://localhost:8080/api/contracts/${fileId}?userId=test_user_123`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Status:', getResponse.status, getResponse.statusText);
        
        const getResult = await getResponse.json();
        console.log('\nGet result:', JSON.stringify(getResult, null, 2));

        if (getResult.success) {
            console.log('\n✅ Contract fetched successfully!');
            console.log('Has ABI:', !!getResult.data.abi);
            console.log('Has Bytecode:', !!getResult.data.bytecode);
            console.log('Bytecode length:', getResult.data.bytecode?.length);
        } else {
            console.log('\n❌ Failed to fetch contract:', getResult.error);
        }
    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
    }
}

testGetContract();
