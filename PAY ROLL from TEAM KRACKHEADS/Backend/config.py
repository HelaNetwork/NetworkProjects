from pydantic_settings import BaseSettings
from pydantic import Field
from pydantic import ConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str  # e.g. mysql+pymysql://user:pass@localhost/dbname
    HELA_RPC_URL: Optional[str] = None
    CONTRACT_ADDRESS: Optional[str] = None
    TAX_VAULT_ADDRESS: Optional[str] = None
    TAX_RATE: int = 10
    SECRET_KEY: Optional[str] = None

settings = Settings()
