from flask import Blueprint, request, jsonify
from models.user_model import User
from models.reward_model import Reward
from database.db_connection import db
from services.reward_service import add_points
from datetime import datetime, timedelta

rewards_bp = Blueprint('rewards', __name__)

@rewards_bp.route('/claim', methods=['POST'])
def claim_reward():
    data = request.json
    wallet_address = data.get('wallet_address')
    profile_id = data.get('profile_id', 1)
    activity_type = data.get('activity_type', 'dapp_interaction')
    score = data.get('score', 0)
    
    # Simulate claiming activity recorded by frontend
    reward = add_points(wallet_address, activity_type, score=score, profile_id=profile_id)
    if not reward:
        return jsonify({"error": "User not registered"}), 404
    
    return jsonify(reward.to_dict()), 200

@rewards_bp.route('/redeem', methods=['POST'])
def redeem_points():
    data = request.json
    wallet_address = data.get('wallet_address')
    profile_id = data.get('profile_id', 1)
    points_to_redeem = int(data.get('points', 1000))
    
    user = User.query.filter_by(wallet_address=wallet_address, profile_id=profile_id).first()
    if not user:
        return jsonify({"error": "User not registered"}), 404
        
    if points_to_redeem < 1000 or points_to_redeem % 1000 != 0:
        return jsonify({"error": "Points must be in multiples of 1000"}), 400
        
    # Calculate current total points
    rewards = Reward.query.filter_by(user_id=user.id).all()
    total_points = sum(r.points for r in rewards)
    
    if total_points < points_to_redeem:
        return jsonify({"error": "Insufficient points"}), 400
        
    token_to_add = float(points_to_redeem) / 1000.0
        
    # Deduct points, add token
    new_reward = Reward(user_id=user.id, points=-points_to_redeem, token_amount=token_to_add)
    db.session.add(new_reward)
    db.session.commit()
    
    return jsonify(new_reward.to_dict()), 200

@rewards_bp.route('/balance/<wallet_address>', methods=['GET'])
def get_total_balance(wallet_address):
    profile_id = request.args.get('profile_id', 1, type=int)
    user = User.query.filter_by(wallet_address=wallet_address, profile_id=profile_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    rewards = Reward.query.filter_by(user_id=user.id).all()
    total_points = sum(r.points for r in rewards)
    total_tokens = sum(r.token_amount for r in rewards)
    
    return jsonify({
        "total_points": total_points,
        "total_tokens": total_tokens
    }), 200

@rewards_bp.route('/<wallet_address>', methods=['GET'])
def get_reward_history(wallet_address):
    profile_id = request.args.get('profile_id', 1, type=int)
    user = User.query.filter_by(wallet_address=wallet_address, profile_id=profile_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Return last 24h for the Activity Stream UI, but frontend will use /balance for header
    last_24h = datetime.utcnow() - timedelta(hours=24)
    rewards = Reward.query.filter(
        Reward.user_id == user.id,
        Reward.created_at >= last_24h
    ).order_by(Reward.created_at.desc()).all()
    return jsonify([r.to_dict() for r in rewards]), 200
