
# PayStream – Complete Setup Guide

This guide explains how to set up PayStream from scratch, including oracle setup, contract deployment, backend configuration, frontend deployment, Docker setup, and production hosting.


## 1. Oracle Setup

The oracle signs exchange rates used by the OffRamp contract.

### Generate the Oracle Wallet

```bash
cd contracts
node generate-oracle.js
````

You will get:

Address: 0x...
Private Key: 0x...

Save both securely. You will need the address during contract deployment and the private key for backend configuration.

The oracle wallet does not need funds because it only signs messages.

---

## 2. Deploy Contracts

### Install Dependencies

```bash
cd contracts
npm install
cp .env.example .env
```

### Configure contracts/.env

```
PRIVATE_KEY=0x...
HELA_RPC_URL=https://testnet-rpc.helachain.com
ORACLE_SIGNER=0x...
```

* `PRIVATE_KEY` must be a wallet with enough HLUSD for gas.
* `ORACLE_SIGNER` must match the oracle wallet address generated earlier.

### Deploy

```bash
npx hardhat run scripts/deploy.js --network hela
```

After deployment, you will see contract addresses for:

* Treasury
* SalaryStream
* OffRamp

These are also stored in `contracts/deployments/paystream-hela.json`. Keep these addresses.

---

## 3. Environment Configuration

In the project root:

```bash
cp .env.example .env
```

Edit `.env`:

```
MONGODB_URI=your_database_connection_string
ORACLE_PRIVATE_KEY=0x...

VITE_TREASURY_CONTRACT=0x...
VITE_STREAM_CONTRACT=0x...
VITE_OFFRAMP_CONTRACT=0x...

CORS_ORIGIN=http://web3.iitmandi.co.in:8351
VITE_API_URL=https://web3.iitmandi.co.in/api
VITE_ADMIN_ADDRESS=0x...
```

Make sure:

* Contract addresses match your deployment.
* `ORACLE_PRIVATE_KEY` matches the oracle address used in deployment.
* API URLs match your actual server.

Do not commit this file to Git.

---

## 4. Local Development (Optional)

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

backend/.env:

```
PORT=5000
MONGODB_URI=...
ORACLE_PRIVATE_KEY=0x...
```

Start:

```bash
npm start
```

Runs on: [http://localhost:5000](http://localhost:5000)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

frontend/.env:

```
VITE_API_URL=http://localhost:5000
VITE_TREASURY_CONTRACT=0x...
VITE_STREAM_CONTRACT=0x...
VITE_OFFRAMP_CONTRACT=0x...
VITE_ADMIN_ADDRESS=0x...
```

Start:

```bash
npm run dev
```

Runs on: [http://localhost:5173](http://localhost:5173)

---

## 5. Docker Deployment

From the project root:

```bash
docker compose up -d --build
```

This builds and runs both services:

* Frontend on port 8351
* Backend on port 8352

Check status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop services:

```bash
docker compose down
```

---

## 6. Production with Nginx and HTTPS

Install Nginx:

```bash
sudo apt update
sudo apt install nginx
```

Create an Nginx config file in `/etc/nginx/sites-available/paystream` and configure:

* Port 80 redirect to HTTPS
* Port 443 proxy to frontend (8351)
* `/api/` proxy to backend (8352)

Install SSL with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d web3.iitmandi.co.in
```

Enable config:

```bash
sudo ln -s /etc/nginx/sites-available/paystream /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Update `.env` for production:

```
CORS_ORIGIN=https://paystream.softkernel.tech
VITE_API_URL=https://paystream.softkernel.tech/api
```

Rebuild:

```bash
docker compose down
docker compose up -d --build
```