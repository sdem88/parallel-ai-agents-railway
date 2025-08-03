from fastapi import FastAPI, Query
import httpx
import tiktoken
import os
import json
from datetime import datetime

GATEWAY = os.getenv("GATEWAY_URL", "http://lite_proxy:4000")
PORT = int(os.getenv("PORT", "4000"))

app = FastAPI(title="Parallel AI Agents Gateway")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "api-gateway",
        "timestamp": datetime.utcnow().isoformat(),
        "gateway_url": GATEWAY,
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "local"),
        "port": PORT
    }

@app.get("/models")
async def list_models():
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{GATEWAY}/v1/models")
    r.raise_for_status()
    return r.json()

@app.post("/estimate")
async def estimate_cost(prompt: str, model: str = Query("gpt-3.5-turbo-0125")):
    enc = tiktoken.encoding_for_model(model)
    tokens = len(enc.encode(prompt))
    async with httpx.AsyncClient() as client:
        price = (await client.post(f"{GATEWAY}/pricing", json={"model": model})).json()["price_per_1k"]
    cost = tokens * price / 1000
    return {"tokens": tokens, "estimated_cost": cost}