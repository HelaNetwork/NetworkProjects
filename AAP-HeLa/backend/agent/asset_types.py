"""AAP — Asset Types: unified enum + dataclass for multi-asset support."""
from __future__ import annotations
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional


class AssetType(str, Enum):
    EQUITY      = "EQUITY"
    CRYPTO      = "CRYPTO"
    ETH         = "ETH"
    MUTUAL_FUND = "MUTUAL_FUND"


@dataclass
class Asset:
    symbol:     str
    asset_type: AssetType
    name:       str        = ""
    currency:   str        = "INR"
    # optional metadata
    scheme_code: Optional[str] = None   # for mutual funds
    chain:       Optional[str] = None   # for crypto/ETH

    @property
    def display_symbol(self) -> str:
        prefix = {
            AssetType.EQUITY:      "",
            AssetType.CRYPTO:      "₿ ",
            AssetType.ETH:         "Ξ ",
            AssetType.MUTUAL_FUND: "MF ",
        }.get(self.asset_type, "")
        return f"{prefix}{self.symbol}"

    def is_crypto(self) -> bool:
        return self.asset_type in (AssetType.CRYPTO, AssetType.ETH)


# ── Pre-defined asset catalogs ─────────────────────────────────────────

NSE_EQUITIES = [
    Asset("RELIANCE",   AssetType.EQUITY, "Reliance Industries"),
    Asset("TCS",        AssetType.EQUITY, "Tata Consultancy Services"),
    Asset("HDFC",       AssetType.EQUITY, "HDFC Bank"),
    Asset("INFY",       AssetType.EQUITY, "Infosys"),
    Asset("WIPRO",      AssetType.EQUITY, "Wipro"),
    Asset("ICICIBANK",  AssetType.EQUITY, "ICICI Bank"),
    Asset("KOTAKBANK",  AssetType.EQUITY, "Kotak Mahindra Bank"),
    Asset("BHARTIARTL", AssetType.EQUITY, "Bharti Airtel"),
]

CRYPTO_ASSETS = [
    Asset("bitcoin",  AssetType.CRYPTO, "Bitcoin",  "USD"),
    Asset("ethereum", AssetType.ETH,    "Ethereum", "USD"),
    Asset("solana",   AssetType.CRYPTO, "Solana",   "USD"),
    Asset("bnb",      AssetType.CRYPTO, "BNB",      "USD"),
    Asset("matic-network", AssetType.CRYPTO, "Polygon", "USD"),
]

# Top Indian mutual funds (MFAPI scheme codes)
MUTUAL_FUNDS = [
    Asset("100033", AssetType.MUTUAL_FUND, "SBI Bluechip Fund",           scheme_code="100033"),
    Asset("119598", AssetType.MUTUAL_FUND, "Mirae Asset Large Cap Fund",  scheme_code="119598"),
    Asset("120503", AssetType.MUTUAL_FUND, "Axis Bluechip Fund",          scheme_code="120503"),
    Asset("125354", AssetType.MUTUAL_FUND, "Parag Parikh Flexi Cap Fund", scheme_code="125354"),
    Asset("120716", AssetType.MUTUAL_FUND, "HDFC Mid-Cap Opportunities",  scheme_code="120716"),
]
