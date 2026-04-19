import time
import os
import json
from dotenv import load_dotenv
from web3 import Web3

def run_mock_agent():
    load_dotenv()
    
    rpc_url = os.getenv("HELA_RPC", "https://testnet-rpc.helachain.com")
    private_key = os.getenv("PRIVATE_KEY")
    contract_address = os.getenv("CONTRACT_ADDRESS")
    
    if not private_key or not contract_address:
        print("Error: PRIVATE_KEY or CONTRACT_ADDRESS missing from .env")
        return
        
    print(f"Connecting to HeLa Testnet at {rpc_url}...")
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    if not w3.is_connected():
        print("Failed to connect to blockchain.")
        return
        
    print(f"Connected! Chain ID: {w3.eth.chain_id}")
    
    with open("abi.json", "r") as f:
        abi = json.load(f)
        
    contract = w3.eth.contract(address=contract_address, abi=abi)
    account = w3.eth.account.from_key(private_key)
    
    decisions = [
        ("swap ETH to USDC", "Market volatility detected, reducing ETH exposure by 15%", 500),
        ("stake 10 HELA tokens", "Staking APY at 12.4%, optimal compounding window identified", 10),
        ("vote YES on Proposal #42", "Proposal improves protocol security, risk model approves", 0),
        ("transfer 5 USDC to treasury", "Monthly protocol fee collection — scheduled action", 5),
        ("withdraw LP position", "Impermanent loss exceeds 8% threshold, exiting position", 100),
        ("purchase ETH on price dip", "RSI dropped below 28, historical buy signal confirmed", 200)
    ]
    
    nonce = w3.eth.get_transaction_count(account.address)
    
    for action, reason, amount in decisions:
        print(f"\nSubmitting decision: {action}")
        
        tx = contract.functions.logDecision(action, reason, amount).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 500000,
            'gasPrice': w3.eth.gas_price
        })
        
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        hex_hash = w3.to_hex(tx_hash)
        
        print(f"Tx Hash: {hex_hash}")
        print(f"Explorer URL: https://testnet-scan.helachain.com/tx/{hex_hash}")
        
        # Wait for receipt to ensure sequential nonces work smoothly if network is slow
        # but to keep it simple and hackathon friendly, we just increment and sleep
        nonce += 1
        time.sleep(3)

if __name__ == "__main__":
    run_mock_agent()
