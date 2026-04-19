from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings


class Database:
    def __init__(self):
        self.engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True
        )
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )
        self.Base = declarative_base()

    def get_db(self):
        db = self.SessionLocal()
        try:
            yield db
        finally:
            db.close()

    def create_tables(self):
        self.Base.metadata.create_all(bind=self.engine)


db = Database()
