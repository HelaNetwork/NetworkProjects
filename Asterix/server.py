import uvicorn
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import json
import sqlite3
import datetime

app = FastAPI()

SIMULATION_MODE = False

# Database path
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'agent', 'crisis_agent.db')

@app.get("/api/status")
def get_status():
    """Return the latest status for the UI."""
    global SIMULATION_MODE
    if SIMULATION_MODE:
        return {
            "status": "CRISIS_DETECTED",
            "crisis_score": 95,
            "banking_score": 92,
            "market_score": 98,
            "liquidity_score": 95,
            "message": "IMMEDIATE_LIQUIDATION",
            "crisis": True,
            "ticker": "GLOBAL",
            "company_name": "Simulation Event 2008",
            "timestamp": datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "chart_signals": [
                {'signal': 'Massive liquidity drain detected', 'detected': True, 'weight': 95, 'severity': 'high'},
                {'signal': 'VIX spike > 40', 'detected': True, 'weight': 88, 'severity': 'high'},
                {'signal': 'Yield curve inversion deepening', 'detected': True, 'weight': 82, 'severity': 'high'},
                {'signal': 'Abnormal off-exchange trading volume', 'detected': True, 'weight': 75, 'severity': 'medium'},
                {'signal': 'Unprecedented institutional sell-offs', 'detected': True, 'weight': 90, 'severity': 'high'},
                {'signal': 'Credit default swaps skyrocketing', 'detected': True, 'weight': 89, 'severity': 'high'},
                {'signal': 'Deteriorating market breadth', 'detected': True, 'weight': 70, 'severity': 'medium'}
            ],
            "news_signals": [
                {'title': 'Systemic banking failures reported', 'sentiment': 'negative', 'weight': 92, 'severity': 'high'},
                {'title': 'Central bank emergency meeting called', 'sentiment': 'negative', 'weight': 89, 'severity': 'high'},
                {'title': 'Major hedge fund liquidation confirmed', 'sentiment': 'negative', 'weight': 85, 'severity': 'high'},
                {'title': 'Regulatory bodies freeze trading on several major indices', 'sentiment': 'negative', 'weight': 91, 'severity': 'high'},
                {'title': 'Rumors of sovereign debt default circulating', 'sentiment': 'negative', 'weight': 87, 'severity': 'high'},
                {'title': 'Corporate bond spreads widen significantly', 'sentiment': 'negative', 'weight': 80, 'severity': 'medium'}
            ],
            "news_headlines": [
                {'title': 'Global markets plummet as systemic risk rises', 'sentiment': 'negative', 'timestamp': 'Just now'},
                {'title': 'Trading halted on major exchanges amid extreme volatility', 'sentiment': 'negative', 'timestamp': '2m ago'},
                {'title': 'Government officials refuse to comment on bailout rumors', 'sentiment': 'negative', 'timestamp': '5m ago'},
                {'title': 'Interbank lending rates spike to decade highs', 'sentiment': 'negative', 'timestamp': '8m ago'},
                {'title': 'Retail investors panic sell blue-chip stocks', 'sentiment': 'negative', 'timestamp': '12m ago'},
                {'title': 'Safe haven assets surge: Gold up 4% in early trading', 'sentiment': 'neutral', 'timestamp': '15m ago'},
                {'title': 'Investors flee to cash amid historic uncertainty', 'sentiment': 'negative', 'timestamp': '20m ago'},
                {'title': 'European markets open 5% down', 'sentiment': 'negative', 'timestamp': '25m ago'},
                {'title': 'Major tech companies report massive revenue shortfalls', 'sentiment': 'negative', 'timestamp': '30m ago'}
            ]
        }

    try:
        if not os.path.exists(DB_PATH):
            return {
                "status": "watching",
                "crisis_score": 50,
                "message": "Waiting for live data... (DB not found)",
                "crisis": False
            }
            
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get the latest crisis analysis from the database
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='scans'")
        if cursor.fetchone():
            cursor.execute("SELECT * FROM scans ORDER BY id DESC LIMIT 1")
            row = cursor.fetchone()
            if row:
                data = dict(row)
                full_output = {}
                if data.get("full_output"):
                    try:
                        full_output = json.loads(data["full_output"])
                    except Exception:
                        full_output = {}

                return {
                    "status": data.get("status", "WATCH"),
                    "crisis_score": data.get("crisis_score", 50),
                    "banking_score": data.get("technical_risk", 50),
                    "market_score": data.get("sentiment_risk", 50),
                    "liquidity_score": data.get("combined_risk", 50),
                    "message": data.get("recommended_action", ""),
                    "crisis": data.get("alert_triggered", 0) == 1,
                    "ticker": data.get("ticker", ""),
                    "company_name": data.get("company_name", ""),
                    "timestamp": data.get("scan_timestamp", ""),
                    "chart_signals": full_output.get("chart_signals", []),
                    "news_signals": full_output.get("news_signals", []),
                    "combined_signals": full_output.get("combined_signals", []),
                    "news_headlines": full_output.get("news_headlines", []),
                    "expected_crisis_time": full_output.get("expected_crisis_time"),
                    "crisis_rationale": full_output.get("crisis_rationale", ""),
                    "data_sources": full_output.get("data_sources_used", []),
                }
                
        return {
            "status": "watching",
            "crisis_score": 50,
            "banking_score": 40,
            "market_score": 60,
            "liquidity_score": 50,
            "message": "Waiting for live data...",
            "crisis": False
        }
    except Exception as e:
        return {"error": str(e), "crisis": False}

@app.post("/api/simulate/toggle")
async def toggle_simulate(request: Request):
    """Toggle the simulation mode on or off."""
    global SIMULATION_MODE
    try:
        data = await request.json()
        SIMULATION_MODE = data.get("state", False)
        return {"success": True, "mode": SIMULATION_MODE}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/simulate")
def simulate_crisis():
    """Insert a simulated crisis into the database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Ensure table exists
        cursor.execute('''CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT, company_name TEXT, scan_timestamp TEXT,
            crisis_score INTEGER, technical_risk INTEGER, sentiment_risk INTEGER, combined_risk INTEGER,
            status TEXT, alert_triggered INTEGER, recommended_action TEXT,
            crisis_rationale TEXT, full_output TEXT)''')
            
        full_output = {
            'chart_signals': [
                {'signal': 'Massive liquidity drain detected', 'detected': True, 'weight': 95, 'severity': 'high'},
                {'signal': 'VIX spike > 40', 'detected': True, 'weight': 88, 'severity': 'high'},
                {'signal': 'Yield curve inversion deepening', 'detected': True, 'weight': 82, 'severity': 'high'},
                {'signal': 'Abnormal off-exchange trading volume', 'detected': True, 'weight': 75, 'severity': 'medium'},
                {'signal': 'Unprecedented institutional sell-offs', 'detected': True, 'weight': 90, 'severity': 'high'},
                {'signal': 'Credit default swaps skyrocketing', 'detected': True, 'weight': 89, 'severity': 'high'}
            ],
            'news_signals': [
                {'title': 'Systemic banking failures reported', 'sentiment': 'negative', 'weight': 92, 'severity': 'high'},
                {'title': 'Central bank emergency meeting called', 'sentiment': 'negative', 'weight': 89, 'severity': 'high'},
                {'title': 'Major hedge fund liquidation confirmed', 'sentiment': 'negative', 'weight': 85, 'severity': 'high'},
                {'title': 'Regulatory bodies freeze trading on several major indices', 'sentiment': 'negative', 'weight': 91, 'severity': 'high'}
            ],
            'news_headlines': [
                {'title': 'Global markets plummet as systemic risk rises', 'sentiment': 'negative', 'timestamp': 'Just now'},
                {'title': 'Trading halted on major exchanges amid extreme volatility', 'sentiment': 'negative', 'timestamp': '2m ago'},
                {'title': 'Investors flee to cash amid historic uncertainty', 'sentiment': 'negative', 'timestamp': '5m ago'}
            ]
        }
        
        cursor.execute('''
            INSERT INTO scans (
                ticker, company_name, scan_timestamp, crisis_score, technical_risk, sentiment_risk, combined_risk, 
                status, alert_triggered, recommended_action, crisis_rationale, full_output
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'GLOBAL', 'Simulation Event 2008', datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 
            95, 92, 98, 95, 'CRISIS_DETECTED', 1, 'IMMEDIATE_LIQUIDATION', 
            'Simulated historical crisis triggered by user.', json.dumps(full_output)
        ))
        
        conn.commit()
        return {"success": True, "message": "Simulation triggered"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Mount public directory
app.mount("/", StaticFiles(directory="public", html=True), name="public")

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
