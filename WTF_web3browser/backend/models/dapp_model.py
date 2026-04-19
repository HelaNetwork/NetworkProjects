from database.db_connection import db

class Dapp(db.Model):
    __tablename__ = 'dapps'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=True)
    url = db.Column(db.String(256), nullable=False)
    category = db.Column(db.String(64), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "url": self.url,
            "category": self.category
        }
