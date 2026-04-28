import { network } from 'hardhat'
import { ethers } from 'ethers'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config()

async function main() {
  // Connect to HeLa network
  const provider = new ethers.JsonRpcProvider(
    process.env.VITE_HELA_RPC ?? 'https://testnet-rpc.helachain.com'
  )

  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('PRIVATE_KEY not found in .env')

  const wallet = new ethers.Wallet(privateKey, provider)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  SwapWave — HeLa Testnet Deployment')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Deployer address :', wallet.address)

  const balance = await provider.getBalance(wallet.address)
  console.log('Deployer balance :', ethers.formatEther(balance), 'HLUSD')

  if (balance === 0n) {
    console.error('❌ Wallet has no HLUSD. Get some from https://testnet-faucet.helachain.com')
    process.exit(1)
  }

  // Read compiled artifact
  const artifactPath = path.join(
    process.cwd(), 'artifacts', 'contracts',
    'IntentSwap.sol', 'IntentSwap.json'
  )

  if (!fs.existsSync(artifactPath)) {
    throw new Error('Artifact not found. Run: npx hardhat compile first')
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'))

  console.log('\nDeploying IntentSwap contract...')

  const factory  = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet)
  const contract = await factory.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ IntentSwap deployed to :', address)
  console.log('🔗 Explorer               : https://testnet-blockexplorer.helachain.com/address/' + address)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n📋 Copy this into src/config/contracts.js:')
  console.log(`export const INTENT_SWAP_ADDRESS = '${address}'`)
}

main().catch((err) => {
  console.error('❌ Deployment failed:', err.message)
  process.exit(1)
})