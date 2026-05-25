# AI Wallet Assistant - API Documentation

**Base URL:** `https://api.aiwalletassistant.com/api/v1` (or `http://localhost:5000/api/v1` for local development)

**Authentication:** All endpoints (except `/health`) require JWT token in `Authorization: Bearer <token>` header

---

## 1. Transaction Analysis

### Analyze Transaction

**Endpoint:** `POST /analyze`

Analyzes a blockchain transaction and returns risk assessment with detailed explanations.

**Request Body:**
```json
{
  "transaction_data": {
    "from": "0x742d35Cc6634C0532925a3b844Bc226e4f71aAA0",
    "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "value": "0",
    "data": "0x414bf389...",
    "gasLimit": "200000",
    "gasPrice": "50000000000",
    "nonce": 42,
    "chainId": 1
  },
  "custom_context": "Swapping USDC for ETH on Uniswap",
  "save_to_history": true
}
```

**Response (200 OK):**
```json
{
  "transaction_hash": "0x1234...",
  "risk_level": "MEDIUM",
  "risk_score": 45,
  "summary": "Token swap on trusted DEX with standard parameters",
  "explanation": "This is a legitimate token swap on Uniswap V2. The transaction includes proper slippage controls and recipient verification. No immediate red flags, but verify the token addresses before confirming.",
  "flags": [
    {
      "flag": "dex_interaction",
      "severity": "LOW",
      "description": "Contract interaction with known DEX"
    },
    {
      "flag": "slippage_tolerance",
      "severity": "LOW",
      "description": "Slippage tolerance is set (acceptable)"
    }
  ],
  "recommendations": [
    "Verify the token addresses on CoinGecko or Etherscan",
    "Check current slippage tolerance is acceptable",
    "Ensure recipient address is correct"
  ],
  "contract_info": {
    "address": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "is_verified": true,
    "audited": true,
    "audit_reports": ["OpenZeppelin"],
    "usage_count": 50000000
  },
  "confidence_score": 92,
  "analyzed_at": "2024-01-15T10:30:00Z",
  "expires_at": "2024-01-16T10:30:00Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid transaction data
{
  "error": "Invalid transaction data",
  "details": {
    "from": "Invalid Ethereum address",
    "gasLimit": "Must be a valid number"
  }
}

// 401 Unauthorized - Missing/invalid token
{
  "error": "Unauthorized",
  "message": "Missing or invalid authentication token"
}

// 429 Too Many Requests - Rate limited
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}

// 500 Internal Server Error
{
  "error": "Analysis failed",
  "message": "OpenAI service temporarily unavailable. Using keyword analysis only."
}
```

**Rate Limit:** 100 requests/hour per user

---

## 2. Chat Interface

### Send Message

**Endpoint:** `POST /chat`

Ask questions about cryptocurrency, transactions, and security.

**Request Body:**
```json
{
  "message": "What does unlimited approval mean?",
  "conversation_id": "conv_123abc",
  "user_level": "beginner",
  "transaction_context": {
    "from": "0x...",
    "to": "0x...",
    "data": "0x..."
  }
}
```

**Response (200 OK):**
```json
{
  "answer": "Unlimited approval means you're allowing a contract to spend ANY amount of your tokens without asking again. It's like giving someone a blank check. This is risky because if that contract is hacked or malicious, your entire token balance could be stolen.\n\nBetter approach: Approve only the exact amount you need for that transaction.",
  "follow_ups": [
    "How do I revoke an approval?",
    "What's a safer approval amount?",
    "How do I check my active approvals?"
  ],
  "sources": [
    "https://docs.aave.com/faq/",
    "https://ethereum.org/en/developers/tutorials/token-interactions/"
  ],
  "confidence_score": 95,
  "learning_resources": [
    {
      "title": "Understanding Token Approvals",
      "url": "https://learn.aiwalletassistant.com/approvals",
      "duration_minutes": 5
    }
  ]
}
```

**Rate Limit:** 30 requests/hour per user

---

## 3. Contract Information

### Get Contract Details

**Endpoint:** `GET /contracts/:address`

Retrieve detailed information about a smart contract.

**Query Parameters:**
- `chain_id` (optional): Blockchain network ID (default: 1 for Ethereum mainnet)
- `include_source` (optional): Boolean to include source code

**Response (200 OK):**
```json
{
  "address": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  "chain": "ethereum",
  "name": "Uniswap V2: Router 2",
  "is_verified": true,
  "creator_address": "0x1111111111111111111111111111111111111111",
  "creation_date": "2020-05-05",
  "creation_block": 10086347,
  "source_code": "pragma solidity =0.6.6...",
  "compiler_version": "0.6.6",
  "audited": true,
  "audit_reports": [
    {
      "auditor": "OpenZeppelin",
      "date": "2020-05-01",
      "status": "passed",
      "url": "https://..."
    }
  ],
  "tags": ["DEX", "Verified", "Audited", "Popular"],
  "risk_score": 15,
  "known_risks": [],
  "usage_stats": {
    "total_transactions": 125000000,
    "unique_users": 5000000,
    "total_volume": "1000000000000000000000000"
  },
  "similar_exploits": [],
  "last_updated": "2024-01-15T10:00:00Z"
}
```

**Rate Limit:** 1000 requests/hour per user (cached)

---

## 4. Transaction History

### Get Analysis History

**Endpoint:** `GET /history`

Retrieve user's transaction analysis history.

**Query Parameters:**
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `risk_level` (optional): Filter by risk level (LOW/MEDIUM/HIGH)
- `date_from` (optional): ISO 8601 date
- `date_to` (optional): ISO 8601 date
- `chain` (optional): Filter by blockchain

**Response (200 OK):**
```json
{
  "total": 145,
  "limit": 20,
  "offset": 0,
  "data": [
    {
      "id": "hist_123",
      "transaction_data": {...},
      "analysis": {...},
      "created_at": "2024-01-15T10:30:00Z",
      "chain": "ethereum",
      "status": "analyzed",
      "notes": "Checked before signing"
    }
  ]
}
```

**Rate Limit:** 60 requests/hour

---

## 5. Export Data

### Export History

**Endpoint:** `GET /history/export`

Export transaction history in various formats.

**Query Parameters:**
- `format`: csv | json | pdf (required)
- `date_from` (optional): ISO 8601 date
- `date_to` (optional): ISO 8601 date

**Response:** File download

**Rate Limit:** 10 requests/hour

---

## 6. Health & Status

### Health Check

**Endpoint:** `GET /health`

Check API and dependency status.

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "status": "healthy",
  "uptime_seconds": 3600,
  "version": "2.0.0",
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "openai": "healthy",
    "etherscan": "healthy"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 7. User Management

### Get Profile

**Endpoint:** `GET /user/profile`

Retrieve authenticated user's profile.

**Response (200 OK):**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "created_at": "2023-01-01T00:00:00Z",
  "preferences": {
    "risk_threshold": "balanced",
    "language": "en",
    "notifications_enabled": true,
    "theme": "dark"
  },
  "usage_stats": {
    "analyses_this_month": 156,
    "analyses_total": 1250
  }
}
```

### Update Preferences

**Endpoint:** `PUT /user/preferences`

Update user settings.

**Request Body:**
```json
{
  "risk_threshold": "conservative",
  "language": "es",
  "notifications_enabled": false,
  "theme": "light"
}
```

**Response:** Updated preferences object

---

## 8. Audit Logs (Admin Only)

### Get Audit Logs

**Endpoint:** `GET /admin/audit-logs`

Retrieve system audit logs.

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `user_id` (optional): Filter by user
- `action` (optional): Filter by action type
- `date_from` (optional): ISO 8601 date

**Response (200 OK):**
```json
{
  "total": 1000,
  "data": [
    {
      "id": "log_123",
      "timestamp": "2024-01-15T10:30:00Z",
      "user_id": "user_456",
      "action": "analysis_performed",
      "details": {...},
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0..."
    }
  ]
}
```

---

## Error Codes Reference

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Temporary issue |

---

## Authentication

### Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

### Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Rate Limiting Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1705315800
```

---

## Webhooks (Future)

Subscribe to real-time events:

```json
POST /webhooks/subscribe

{
  "event": "analysis_complete",
  "url": "https://yourapp.com/webhook",
  "active": true
}
```

Events:
- `analysis_complete` – Transaction analysis finished
- `contract_exploit_detected` – New exploit found for contract
- `rate_limit_warning` – Approaching rate limit

---

## Code Examples

### JavaScript / Node.js
```javascript
const analyzeTransaction = async (txData) => {
  const response = await fetch('http://localhost:5000/api/v1/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      transaction_data: txData,
      save_to_history: true
    })
  });
  return response.json();
};
```

### Python
```python
import requests

def analyze_transaction(tx_data, token):
    url = 'http://localhost:5000/api/v1/analyze'
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post(url, json={'transaction_data': tx_data}, headers=headers)
    return response.json()
```

### cURL
```bash
curl -X POST http://localhost:5000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "transaction_data": {
      "from": "0x...",
      "to": "0x...",
      "value": "0",
      "data": "0x...",
      "gasLimit": "100000",
      "nonce": 0
    }
  }'
```

---

**Last Updated:** January 15, 2024  
**Version:** 1.0.0
