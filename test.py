from orchestrator.pipeline import run_pipeline

lead = {
    "id": "lead_001",
    "company": "NovaTech",
    "event": "Series A funding",
    "industry": "SaaS"
}

result = run_pipeline(lead)

print("\nFINAL OUTPUT:\n", result)