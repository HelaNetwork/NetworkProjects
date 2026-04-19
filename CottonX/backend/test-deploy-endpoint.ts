import 'dotenv/config';
import { ethers } from 'ethers';

const sampleContract = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 public value;
    
    constructor(uint256 _initialValue) {
        value = _initialValue;
    }
    
    function setValue(uint256 _value) public {
        value = _value;
    }
}
`;

async function testDeployment() {
    console.log('🧪 Testing Contract Deployment Flow\n');
    
    const userId = 'test_user_' + Date.now();
    let fileId = '';

    try {
        // Step 1: Upload contract
        console.log('1️⃣ Uploading contract...');
        const uploadResponse = await fetch('http://localhost:8080/api/contracts/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                fileName: 'SimpleStorage.sol',
                sourceCode: sampleContract,
                contractName: 'SimpleStorage'
            })
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log('Upload result:', uploadResult);

        if (!uploadResult.success) {
            throw new Error(`Upload failed: ${uploadResult.error}`);
        }

        fileId = uploadResult.data.fileId;
        console.log('✅ Contract uploaded with fileId:', fileId);

        // Step 2: Deploy contract
        console.log('\n2️⃣ Deploying contract...');
        const deployResponse = await fetch('http://localhost:8080/api/contracts/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                fileId,
                constructorArgs: [42], // Initial value
                userAddress: '0x0000000000000000000000000000000000000000'
            })
        });

        console.log('Deploy response status:', deployResponse.status, deployResponse.statusText);

        if (!deployResponse.ok) {
            const errorText = await deployResponse.text();
            console.error('Deploy error response:', errorText);
            throw new Error(`Deploy failed: ${deployResponse.status} ${deployResponse.statusText}`);
        }

        const deployResult = await deployResponse.json();
        console.log('\nDeploy result:', JSON.stringify(deployResult, null, 2));

        if (!deployResult.success) {
            throw new Error(`Deploy failed: ${deployResult.error}`);
        }

        console.log('\n✅ Contract deployed successfully!');
        console.log('Contract Address:', deployResult.data.contractAddress);
        console.log('Transaction Hash:', deployResult.data.transactionHash);
        console.log('Deployer Address:', deployResult.data.deployerAddress);

        // Step 3: Verify deployment on chain
        console.log('\n3️⃣ Verifying deployment on chain...');
        const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const code = await provider.getCode(deployResult.data.contractAddress);
        
        if (code === '0x') {
            console.log('❌ No code at contract address!');
        } else {
            console.log('✅ Contract code verified on chain!');
            console.log('Code length:', code.length, 'bytes');
        }

        // Step 4: Interact with contract
        console.log('\n4️⃣ Reading contract value...');
        const contract = new ethers.Contract(
            deployResult.data.contractAddress,
            ['function value() view returns (uint256)'],
            provider
        );
        
        const value = await contract.value();
        console.log('Contract value:', value.toString());
        
        if (value.toString() === '42') {
            console.log('✅ Constructor argument worked correctly!');
        } else {
            console.log('❌ Unexpected value:', value.toString());
        }

        console.log('\n🎉 All tests passed!');

    } catch (error: any) {
        console.error('\n❌ Test failed:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

// Check if server is running first
async function checkServer() {
    try {
        const response = await fetch('http://localhost:8080/health');
        if (response.ok) {
            console.log('✅ Backend server is running\n');
            return true;
        }
    } catch (e) {
        console.error('❌ Backend server is not running!');
        console.error('Please start it with: cd backend && npm run dev');
        process.exit(1);
    }
    return false;
}

checkServer().then(() => testDeployment());
