from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HELA_RPC: str = "https://testnet-rpc.helachain.com"
    CONTRACT_ADDRESS: str
    PRIVATE_KEY: str
    GOOGLE_API_KEY: str
    CHALLENGE_WINDOW_SECONDS: int = 3600

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
