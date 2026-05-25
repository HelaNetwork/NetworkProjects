"""
ipfs_uploader.py — Upload PDR JSON to IPFS via Pinata.
Returns the IPFS CID for storage in the PDR and on-chain anchor.
"""

import os
import json
import hashlib
import requests
import logging
from datetime import datetime
from typing import Optional

log = logging.getLogger(__name__)

PINATA_BASE = "https://api.pinata.cloud"

class IPFSUploader:
    """Uploads JSON documents to IPFS via Pinata pinning service."""

    def __init__(self):
        self.jwt         = os.getenv("PINATA_JWT", "")
        self.api_key     = os.getenv("PINATA_API_KEY", "")
        self.secret_key  = os.getenv("PINATA_SECRET_KEY", "")
        self._test_connection()

    def _headers(self) -> dict:
        if self.jwt:
            return {"Authorization": f"Bearer {self.jwt}"}
        return {
            "pinata_api_key":        self.api_key,
            "pinata_secret_api_key": self.secret_key,
        }

    def _test_connection(self):
        """Verify Pinata credentials on startup."""
        if not (self.jwt or (self.api_key and self.secret_key)):
            log.warning("No Pinata credentials — IPFS uploads will use local simulation")
            self._simulation_mode = True
            return
        try:
            r = requests.get(f"{PINATA_BASE}/data/testAuthentication",
                             headers=self._headers(), timeout=5)
            if r.status_code == 200:
                log.info("✓ Pinata IPFS connection verified")
                self._simulation_mode = False
            else:
                log.warning(f"Pinata auth failed: {r.text} — using simulation mode")
                self._simulation_mode = True
        except Exception as e:
            log.warning(f"Pinata unreachable: {e} — using simulation mode")
            self._simulation_mode = True

    def upload_pdr(self, pdr: dict) -> dict:
        """
        Upload a PDR JSON to IPFS.
        Returns: {cid, url, size_bytes, timestamp}
        """
        decision_id = pdr.get("decision_id", "unknown")
        json_bytes  = json.dumps(pdr, sort_keys=True, default=str).encode("utf-8")
        size        = len(json_bytes)

        if self._simulation_mode:
            return self._simulate_upload(pdr, decision_id, size)

        try:
            payload = {
                "pinataOptions": {"cidVersion": 1},
                "pinataMetadata": {
                    "name": f"aap_pdr_{decision_id}",
                    "keyvalues": {
                        "protocol":  "AAP",
                        "version":   "1.0",
                        "asset":     pdr.get("asset", ""),
                        "action":    pdr.get("action", ""),
                        "timestamp": pdr.get("timestamp", ""),
                    }
                },
                "pinataContent": pdr
            }

            r = requests.post(
                f"{PINATA_BASE}/pinning/pinJSONToIPFS",
                json=payload,
                headers=self._headers(),
                timeout=30
            )
            r.raise_for_status()
            cid = r.json()["IpfsHash"]

            result = {
                "cid":       cid,
                "url":       f"https://gateway.pinata.cloud/ipfs/{cid}",
                "size_bytes":size,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "simulated": False,
            }
            log.info(f"✓ PDR uploaded to IPFS: {cid}")
            return result

        except Exception as e:
            log.error(f"IPFS upload failed: {e}")
            return self._simulate_upload(pdr, decision_id, size)

    def upload_batch_index(self, batch_index: list[dict]) -> dict:
        """Upload batch index (list of {decision_id, pdr_hash, ipfs_cid})."""
        if self._simulation_mode:
            fake_cid = "Qm" + hashlib.sha256(
                json.dumps(batch_index, sort_keys=True).encode()
            ).hexdigest()[:44]
            return {"cid": fake_cid, "simulated": True}

        try:
            payload = {
                "pinataOptions":  {"cidVersion": 1},
                "pinataMetadata": {"name": f"aap_batch_index_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"},
                "pinataContent":  {"batch": batch_index, "count": len(batch_index)}
            }
            r = requests.post(f"{PINATA_BASE}/pinning/pinJSONToIPFS",
                              json=payload, headers=self._headers(), timeout=30)
            r.raise_for_status()
            cid = r.json()["IpfsHash"]
            log.info(f"✓ Batch index uploaded: {cid}")
            return {"cid": cid, "simulated": False}
        except Exception as e:
            log.error(f"Batch index upload failed: {e}")
            fake_cid = "Qm" + hashlib.sha256(str(batch_index).encode()).hexdigest()[:44]
            return {"cid": fake_cid, "simulated": True}

    def _simulate_upload(self, pdr: dict, decision_id: str, size: int) -> dict:
        """Generate a deterministic fake CID for simulation/testing."""
        content = json.dumps(pdr, sort_keys=True, default=str)
        fake_cid = "Qm" + hashlib.sha256(content.encode()).hexdigest()[:44]
        log.info(f"[SIMULATED] IPFS CID: {fake_cid}")
        return {
            "cid":       fake_cid,
            "url":       f"https://ipfs.io/ipfs/{fake_cid}",
            "size_bytes":size,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "simulated": True,
        }
