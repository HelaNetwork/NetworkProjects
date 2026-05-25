import requests
import time
import threading

# ─────────────────────────────────────────────
#  Multi-Agent Simulation Script
#  Simulates independent agents sending intents
#  to the TAAP Interceptor simultaneously.
# ─────────────────────────────────────────────

BASE_URL = "http://localhost:8000"

AGENT_PROFILES = {
    "DeFi-Trader": [
        ("swap ETH to USDC",          "Market volatility detected, reducing ETH exposure by 15%", 500),
        ("purchase ETH on price dip",  "RSI dropped below 28, historical buy confirmed",           200),
        ("withdraw LP position",       "Impermanent loss exceeds 8% — exiting position",           100),
    ],
    "DAO-Governor": [
        ("vote YES on Proposal #42",        "Proposal improves protocol security, risk model approves",  0),
        ("vote NO on Proposal #43",         "Proposal creates centralization risk — AI rejects",         0),
        ("transfer 5 USDC to treasury",     "Monthly protocol fee collection — scheduled action",        5),
    ],
    "Yield-Optimizer": [
        ("stake 10 HELA tokens",            "Staking APY at 12.4%, optimal compounding window",         10),
        ("restake compounding rewards",     "Auto-compound triggered at 0.5 HELA threshold",              1),
    ],
}


def submit_intent(agent_name, action, reason, amount):
    """Submit a single intent from a named agent to the interceptor."""
    payload = {"action": action, "reason": reason, "amount": amount}
    try:
        response = requests.post(f"{BASE_URL}/audit/submit-intent", json=payload, timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"[{agent_name}] OK  | Risk: {data.get('risk_score', '?')}/10 | {action[:40]}")
        else:
            print(f"[{agent_name}] FAIL | Status {response.status_code} | {action[:40]}")
    except Exception as e:
        print(f"[{agent_name}] ERROR | {e}")


def run_agent(agent_name, decisions, delay_between=3):
    """Run a single agent's decision list sequentially."""
    print(f"\n[{agent_name}] Starting with {len(decisions)} intents...\n")
    for action, reason, amount in decisions:
        submit_intent(agent_name, action, reason, amount)
        time.sleep(delay_between)
    print(f"\n[{agent_name}] All intents submitted.")


def run_multi_agent_simulation():
    """Launch all agents simultaneously as separate threads."""
    print("=" * 60)
    print("  TAAP Multi-Agent Simulation")
    print("  Launching agents concurrently...")
    print("=" * 60)

    threads = []
    for agent_name, decisions in AGENT_PROFILES.items():
        t = threading.Thread(
            target=run_agent,
            args=(agent_name, decisions),
            daemon=True
        )
        threads.append(t)
        t.start()
        time.sleep(0.5)   # stagger start times slightly

    # Wait for all agents to finish
    for t in threads:
        t.join()

    print("\n" + "=" * 60)
    print("  All agents finished. Open the Command Center to review.")
    print("=" * 60)


if __name__ == "__main__":
    run_multi_agent_simulation()
