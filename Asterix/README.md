# Asterix Project Submission

## Product Overview
Asterix is a real-time financial crisis monitoring dashboard built with FastAPI, SQLite, and a static frontend. It detects and reports market stress signals, liquidity warnings, and crisis alerts for finance teams.

## Use Case
This application is designed for risk management teams, trading desks, and financial analysts who need fast, actionable alerts when markets show signs of systemic stress.

## Architecture
- server.py: FastAPI backend serving status APIs and static UI.
- gent/: backend data analysis and scan persistence.
- public/, pages/, ui.tsx: frontend UI assets and pages.
- devclash/: optional Node-based service included as additional backend tooling.

## HeLa Integration
The app can be extended to integrate with the HeLa Network for on-chain event publishing, payment streaming, and decentralized alert verification. Current submission focuses on the core monitoring dashboard.

## Deployment Details
1. Install Python dependencies: pip install fastapi uvicorn
2. Run the backend from the project folder: python server.py
3. Open http://127.0.0.1:8000

## Demo
The app provides a crisis status dashboard with chart and news signal summaries. A simulated crisis endpoint is available at /api/simulate.