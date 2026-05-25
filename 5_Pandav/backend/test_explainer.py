import asyncio
from ai_explainer import ai_explainer

decision = {
    "action": "Buy 50 ETH", 
    "reason": "Market undervalued", 
    "amount": 50000, 
    "timestamp": "Now", 
    "status_label": "Pending", 
    "id": 1
}

res = ai_explainer.explain_decision(decision)
print("EXPLAIN RESULT:", res)
