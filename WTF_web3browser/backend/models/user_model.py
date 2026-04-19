from database.db_connection import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    wallet_address = db.Column(db.String(128), nullable=False)
    profile_id = db.Column(db.Integer, default=1)
    profile_name = db.Column(db.String(50), default='Primary Core')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Unique constraint on wallet + profile
    __table_args__ = (db.UniqueConstraint('wallet_address', 'profile_id', name='_wallet_profile_uc'),)

    def to_dict(self):
        return {
            "id": self.id,
            "wallet_address": self.wallet_address,
            "profile_id": self.profile_id,
            "profile_name": self.profile_name,
            "created_at": self.created_at.isoformat()
        }
