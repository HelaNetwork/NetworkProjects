import json
import time
from web3 import Web3
from web3.exceptions import Web3Exception
from fastapi import HTTPException
from config import settings

class BlockchainService:
    def __init__(self):
        try:
            self.w3 = Web3(Web3.HTTPProvider(settings.HELA_RPC))
            with open("abi.json", "r") as f:
                abi = json.load(f)
            self.contract = self.w3.eth.contract(address=settings.CONTRACT_ADDRESS, abi=abi)
        except Exception as e:
            print(f"Failed to initialize BlockchainService: {e}")

    def is_connected(self) -> bool:
        try:
            return self.w3.is_connected()
        except:
            return False

    def get_total_decisions(self) -> int:
        try:
            return self.contract.functions.totalDecisions().call()
        except Exception as e:
            raise HTTPException(status_code=503, detail={"error": "HeLa blockchain unreachable", "message": str(e)})

    def get_decision(self, id: int) -> dict:
        try:
            total = self.get_total_decisions()
            if id >= total:
                raise HTTPException(status_code=404, detail={"error": "Decision not found"})
                
            decision_data = self.contract.functions.getDecision(id).call()
            # Struct: id, action, reason, amount, explanationHash, timestamp, agent, agentName, status, disputed
            
            d_id, action, reason, amount, explanation_hash, timestamp, agent, agentName, status, disputed = decision_data
            
            status_labels = {0: "Pending", 1: "Challenged", 2: "Resolved"}
            status_label = status_labels.get(status, "Unknown")
            
            current_time = int(time.time())
            is_challengeable = (status == 0) and ((current_time - timestamp) <= settings.CHALLENGE_WINDOW_SECONDS)
            
            return {
                "id": d_id,
                "action": action,
                "reason": reason,
                "amount": str(amount),
                "explanation_hash": explanation_hash,
                "timestamp": timestamp,
                "agent": agent,
                "agentName": agentName,
                "status": status,
                "status_label": status_label,
                "disputed": disputed,
                "is_challengeable": is_challengeable,
                "explorer_url": f"https://testnet-blockexplorer.helachain.com/address/{agent}"
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=503, detail={"error": "HeLa blockchain unreachable", "message": str(e)})

    def get_all_decisions(self) -> list[dict]:
        try:
            total = self.get_total_decisions()
            decisions = []
            for i in range(total):
                decisions.append(self.get_decision(i))
            return decisions
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=503, detail={"error": "HeLa blockchain unreachable", "message": str(e)})

    def log_decision(self, agent_name: str, action: str, reason: str, amount: int, explanation_hash: str, private_key: str) -> str:
        try:
            account = self.w3.eth.account.from_key(private_key)
            # Always fetch fresh 'pending' nonce to avoid conflicts on rapid submissions
            nonce = self.w3.eth.get_transaction_count(account.address, 'pending')
            
            tx = self.contract.functions.logDecision(agent_name, action, reason, amount, explanation_hash).build_transaction({
                'from': account.address,
                'nonce': nonce,
                'gas': 500000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # Fire-and-forget: do NOT wait for receipt here.
            # The tx is already broadcast to the mempool — return the hash immediately.
            # The HeLa explorer will confirm it within seconds.
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            raise HTTPException(status_code=503, detail={"error": "HeLa blockchain unreachable", "message": str(e)})

    def resolve_dispute(self, decision_id: int, upheld: bool) -> str:
        """
        Call resolveDispute(id, upheld) on-chain using the governance private key.
        upheld=True  => challenge valid, agent penalised  (-50 reputation)
        upheld=False => challenge invalid, agent rewarded (+10 reputation)
        """
        try:
            account = self.w3.eth.account.from_key(settings.PRIVATE_KEY)
            nonce = self.w3.eth.get_transaction_count(account.address, 'pending')

            tx = self.contract.functions.resolveDispute(decision_id, upheld).build_transaction({
                'from': account.address,
                'nonce': nonce,
                'gas': 300000,
                'gasPrice': self.w3.eth.gas_price,
            })

            signed_tx = self.w3.eth.account.sign_transaction(tx, settings.PRIVATE_KEY)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            raise HTTPException(status_code=503, detail={"error": "resolveDispute failed", "message": str(e)})

    def get_chain_info(self) -> dict:
        try:
            return {
                "chain_id": self.w3.eth.chain_id,
                "block_number": self.w3.eth.block_number,
                "connected": self.is_connected()
            }
        except Exception as e:
            raise HTTPException(status_code=503, detail={"error": "HeLa blockchain unreachable", "message": str(e)})

blockchain_service = BlockchainService()
