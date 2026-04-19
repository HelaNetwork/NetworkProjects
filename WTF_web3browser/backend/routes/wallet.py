from flask import Blueprint, request, jsonify
from services.reward_service import add_points

wallet_bp = Blueprint('wallet', __name__)

@wallet_bp.route('/connect', methods=['POST'])
def connect_wallet():
    data = request.json
    wallet_address = data.get('wallet_address')
    
    if not wallet_address:
        return jsonify({"error": "Wallet address is required"}), 400
    
    # Simulate a reward for connecting wallet
    add_points(wallet_address, 'login')
    
    return jsonify({"message": "Wallet connection logged", "wallet_address": wallet_address}), 200
