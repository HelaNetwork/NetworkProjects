import 'dotenv/config';
import { storeContractFile, compileContract, getContractFile } from './src/lambda/tools/handlers/deploy-custom-contract';

// Sample ERC20 contract for testing
const sampleContract = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}
`;

async function testCustomContract() {
    console.log('🧪 Testing Custom Contract System\n');
    
    // Test 1: Compile contract
    console.log('1️⃣ Testing compilation...');
    const compiled = compileContract(sampleContract, 'SimpleToken');
    
    if (compiled.success) {
        console.log('✅ Compilation successful!');
        console.log(`   - ABI length: ${compiled.abi?.length} functions`);
        console.log(`   - Bytecode length: ${compiled.bytecode?.length} characters`);
    } else {
        console.log('❌ Compilation failed:', compiled.error);
        return;
    }
    
    // Test 2: Store contract file
    console.log('\n2️⃣ Testing file storage...');
    try {
        const contractFile = await storeContractFile(
            'test_user_123',
            'SimpleToken.sol',
            sampleContract,
            'SimpleToken'
        );
        console.log('✅ Contract file stored!');
        console.log(`   - File ID: ${contractFile.fileId}`);
        console.log(`   - Contract Name: ${contractFile.contractName}`);
        
        // Test 3: Retrieve contract file
        console.log('\n3️⃣ Testing file retrieval...');
        const retrieved = await getContractFile('test_user_123', contractFile.fileId);
        
        if (retrieved) {
            console.log('✅ Contract file retrieved!');
            console.log(`   - File Name: ${retrieved.fileName}`);
            console.log(`   - Compiled: ${retrieved.compiled}`);
        } else {
            console.log('❌ Failed to retrieve contract file');
        }
        
    } catch (error: any) {
        console.log('❌ Storage test failed:', error.message);
    }
    
    console.log('\n✨ Custom contract system is ready!');
    console.log('\n📝 Next steps:');
    console.log('   1. Users can upload .sol files via POST /api/contracts/upload');
    console.log('   2. They receive a fileId in response');
    console.log('   3. Agents can deploy using Deploy_Custom_Contract_Tool with the fileId');
    console.log('   4. Contracts are compiled and deployed to HeLa testnet');
}

testCustomContract().catch(console.error);
