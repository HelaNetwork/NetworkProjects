import os
from web3 import Web3
import solcx
import json
from dotenv import load_dotenv

load_dotenv()

# Install solc dynamically
solcx.install_solc('0.8.9')
solcx.set_solc_version('0.8.9')

w3 = Web3(Web3.HTTPProvider(os.getenv('HELA_RPC')))
if not w3.is_connected():
    print("Cannot connect to HeLa")
    exit(1)

account = w3.eth.account.from_key(os.getenv('PRIVATE_KEY'))

print("Compiling Contract...")
compiled = solcx.compile_files(
    ["../contracts/AgentAuditLogger.sol"],
    output_values=["abi", "bin"]
)

contract_id, contract_interface = compiled.popitem()
abi = contract_interface['abi']
bytecode = contract_interface['bin']

print("Deploying Contract...")
AgentLogger = w3.eth.contract(abi=abi, bytecode=bytecode)

nonce = w3.eth.get_transaction_count(account.address)
tx = AgentLogger.constructor().build_transaction({
    'from': account.address,
    'nonce': nonce,
    'gas': 3000000,
    'gasPrice': w3.eth.gas_price
})

signed_tx = w3.eth.account.sign_transaction(tx, os.getenv('PRIVATE_KEY'))
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

print(f"Deployment Tx Hash: {w3.to_hex(tx_hash)}")
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

contract_address = tx_receipt.contractAddress
print(f"Deployed to: {contract_address}")

with open("abi.json", "w") as f:
    json.dump(abi, f, indent=2)

print("Saved abi.json")
