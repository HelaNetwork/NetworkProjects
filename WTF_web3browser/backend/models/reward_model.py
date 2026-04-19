from database.db_connection import db
from datetime import datetime

class Reward(db.Model):
    __tablename__ = 'rewards'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    points = db.Column(db.Integer, default=0)
    activity_type = db.Column(db.String(50), default='dapp_interaction')
    token_amount = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "points": self.points,
            "activity_type": self.activity_type,
            "token_amount": self.token_amount,
            "created_at": self.created_at.isoformat()
        }
