from database.db_connection import db
from models.user_model import User
from models.reward_model import Reward
from datetime import datetime, date

def add_points(wallet_address, activity_type, score=0, profile_id=1):
    user = User.query.filter_by(wallet_address=wallet_address, profile_id=profile_id).first()
    if not user:
        return None
        
    # Unlimited earning as per user request
    pass

    points = 0
    if activity_type == 'dapp_interaction':
        points = 1 # 1pt per minute passive
    elif activity_type == 'login':
        points = 10
    elif activity_type == 'wtf_quest':
        points = 50
    elif activity_type == 'wtf_quest_action':
        # Reward scaled by performance
        points = max(5, int(score / 5)) 
    elif activity_type == 'node_referral':
        points = 50
    elif activity_type == 'signup_bonus':
        points = 3000
    elif activity_type.endswith('_redemption'):
        # For vouchers, score will be the negative cost
        points = -abs(score)
    elif activity_type == 'partner_cashback':
        points = 500
        
    # No cap enforcement
    pass
    
    new_reward = Reward(user_id=user.id, points=points, activity_type=activity_type)
    db.session.add(new_reward)
    db.session.commit()
    return new_reward
